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

// Route to get all evaluators
router.get('/evaluators', checkAuthenticated, async (req, res) => {
    try {
        const query = `
            SELECT "firstName", "lastName", "isTA"
            FROM "Instructor"
        `;
        const result = await pool.query(query);
        const evaluators = result.rows.map(row => ({
            name: `${row.firstName} ${row.lastName}`,
            TA: row.isTA
        }));
        res.json(evaluators);
    } catch (err) {
        console.error('Error fetching evaluators:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Get all instructors
router.get('/admin-api/get-instructors', async (req, res) => {
  try {
      const result = await pool.query('SELECT * FROM "Instructor"');
      res.status(200).json(result.rows);
  } catch (err) {
      console.error('Error fetching instructors:', err.message);
      res.status(500).json({ error: 'Internal server error' });
  }
});

// Change access level of an instructor
router.put('/admin-api/change-access/:instructorId', async (req, res) => {
  const { instructorId } = req.params;
  const { hasFullAccess } = req.body;

  try {
      const result = await pool.query(
          'UPDATE "Instructor" SET "hasFullAccess" = $1 WHERE "instructorId" = $2 RETURNING *',
          [hasFullAccess, instructorId]
      );
      res.status(200).json(result.rows[0]);
  } catch (err) {
      console.error('Error changing access level:', err.message);
      res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove an instructor
router.delete('/admin-api/remove-instructor/:instructorId', async (req, res) => {
  const { instructorId } = req.params;

  try {
      await pool.query('DELETE FROM "Instructor" WHERE "instructorId" = $1', [instructorId]);
      res.status(200).json({ message: 'Instructor removed' });
  } catch (err) {
      console.error('Error removing instructor:', err.message);
      res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new instructor
router.post('/admin-api/createUser', async (req, res) => {
  const { firstName, lastName, email, password, department, hasFullAccess } = req.body;

  if (!firstName || !lastName || !email || !password || !department) {
    return res.status(400).json({ error: 'Please fill in all fields' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO "Instructor" ("firstName", "lastName", "email", "userPassword", "department", "hasFullAccess") VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [firstName, lastName, email, hashedPassword, department, hasFullAccess]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating user:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;