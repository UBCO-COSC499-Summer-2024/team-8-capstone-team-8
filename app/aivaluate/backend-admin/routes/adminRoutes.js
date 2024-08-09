const express = require('express');
const router = express.Router();
const { pool } = require('../dbConfig');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Middleware to check if authenticated
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/admin-api/login');
}

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  auth: {
    user: process.env.SENDINBLUE_USER,
    pass: process.env.SENDINBLUE_PASS,
  },
});

async function sendMail(to, subject, text) {
  const mailOptions = {
    from: `AIvaluate <${process.env.SENDINBLUE_FROM}>`,
    to,
    subject,
    text,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    console.error('Error sending email:', error.message);
    throw new Error('Error sending email');
  }
}

router.get('/admin-api/dashboard', (req, res) => {
    res.send('Admin Dashboard');
});

router.post('/forgotpassword', async (req, res) => {
  const { email } = req.body;
  
  try {
    const result = await pool.query('SELECT * FROM "SystemAdministrator" WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No account with that email found' });
    }

    const admin = result.rows[0];
    const { default: cryptoRandomString } = await import('crypto-random-string');
    const token = cryptoRandomString({ length: 20, type: 'url-safe' });
    const tokenExpiration = new Date(Date.now() + 3600000); // 1 hour

    await pool.query('UPDATE "SystemAdministrator" SET "resetPasswordToken" = $1, "resetPasswordExpires" = $2 WHERE "adminId" = $3', [token, tokenExpiration, admin.adminId]);

    const mailOptions = {
      to: admin.email,
      subject: 'AIvaluate Password Reset',
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
             Please click on the following link, or paste this into your browser to complete the process within one hour of receiving it:\n\n
             http://localhost:5173/admin/resetpassword/${token}\n\n
             If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };

    await sendMail(mailOptions.to, mailOptions.subject, mailOptions.text);
    res.status(200).json({ message: 'Recovery email sent' });
  } catch (error) {
    console.error('Error during forgot password process:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/reset/:token', async (req, res) => {
  const { password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  if (password.length < 6 || !/\d/.test(password) || !/[a-zA-Z]/.test(password)) {
    return res.status(400).json({ message: 'Password must be longer than 6 characters and include a combination of letters and numbers' });
  }

  try {
    const result = await pool.query('SELECT * FROM "SystemAdministrator" WHERE "resetPasswordToken" = $1 AND "resetPasswordExpires" > NOW()', [req.params.token]);
    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
    }

    const admin = result.rows[0];
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query('UPDATE "SystemAdministrator" SET "password" = $1, "resetPasswordToken" = $2, "resetPasswordExpires" = $3 WHERE "adminId" = $4', [hashedPassword, null, null, admin.adminId]);

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Error during password reset:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

//from here

// Route to get all evaluators
router.get('/evaluators', checkAuthenticated, async (req, res) => {
    try {
        const query = `
            SELECT "firstName", "lastName", "isTA", "instructorId"
            FROM "Instructor"
        `;
        const result = await pool.query(query);
        const evaluators = result.rows.map(row => ({
            name: `${row.firstName} ${row.lastName}`,
            TA: row.isTA,
            instructorId: row.instructorId
        }));
        res.json(evaluators);
    } catch (err) {
        console.error('Error fetching evaluators:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Route to get current evaluator's ID from session
router.get('/admin/me', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Not authenticated' });
    }
    res.status(200).json({ adminId: req.user.adminId });
});

// Route to get evaluator firstName by adminId
router.get('/admin/:adminId/firstName', async (req, res) => {
    const adminId = parseInt(req.params.adminId);

    try {
        const result = await pool.query('SELECT "firstName" FROM "SystemAdministrator" WHERE "adminId" = $1', [adminId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        res.status(200).json({ firstName: result.rows[0].firstName });
    } catch (error) {
        console.error('Error fetching admin firstName:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to get admin lastName by adminId
router.get('/admin/:adminId/lastName', async (req, res) => {
    const adminId = parseInt(req.params.adminId);

    try {
        const result = await pool.query('SELECT "lastName" FROM "SystemAdministrator" WHERE "adminId" = $1', [adminId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'admin not found' });
        }
        res.status(200).json({ lastName: result.rows[0].lastName });
    } catch (error) {
        console.error('Error fetching admin lastName:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to get admin email by adminId
router.get('/admin/:adminId/email', async (req, res) => {
    const adminId = parseInt(req.params.adminId);

    try {
        const result = await pool.query('SELECT "email" FROM "SystemAdministrator" WHERE "adminId" = $1', [adminId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'admin not found' });
        }
        res.status(200).json({ email: result.rows[0].email });
    } catch (error) {
        console.error('Error fetching admin email:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// Route to get admin password by adminId
router.get('/admin/:adminId/password', async (req, res) => {
    const adminId = parseInt(req.params.adminId);

    try {
        const result = await pool.query('SELECT "password" FROM "SystemAdministrator" WHERE "adminId" = $1', [adminId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'admin not found' });
        }
        res.status(200).json({ password: result.rows[0].password });
    } catch (error) {
        console.error('Error fetching admin password:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to verify admin password by adminId
router.post('/admin/:adminId/verifyPassword', async (req, res) => {
    const adminId = parseInt(req.params.adminId);
    const { currentPassword } = req.body;

    try {
        const result = await pool.query('SELECT "password" FROM "SystemAdministrator" WHERE "adminId" = $1', [adminId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'admin not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, result.rows[0].password);
        if (isMatch) {
            res.status(200).json({ success: true });
        } else {
            res.status(401).json({ success: false, message: 'Incorrect password' });
        }
    } catch (error) {
        console.error('Error verifying password:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to set admin password by adminId
router.put('/admin/:adminId/password', async (req, res) => {
    const adminId = parseInt(req.params.adminId);
    const { password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        await pool.query('UPDATE "SystemAdministrator" SET "password" = $1 WHERE "adminId" = $2', [hashedPassword, adminId]);
        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error updating admin password:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;