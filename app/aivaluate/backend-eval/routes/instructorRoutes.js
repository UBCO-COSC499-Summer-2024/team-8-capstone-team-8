const express = require('express');
const router = express.Router();
const { pool } = require('../dbConfig');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
require('dotenv').config();

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

router.post('/forgotpassword', async (req, res) => {
  const { email } = req.body;

  try {
    const result = await pool.query('SELECT * FROM "Instructor" WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No account with that email found' });
    }

    const instructor = result.rows[0];
    const { default: cryptoRandomString } = await import('crypto-random-string');
    const token = cryptoRandomString({ length: 20, type: 'url-safe' });
    const tokenExpiration = new Date(Date.now() + 3600000); // 1 hour

    await pool.query('UPDATE "Instructor" SET "resetPasswordToken" = $1, "resetPasswordExpires" = $2 WHERE "instructorId" = $3', [token, tokenExpiration, instructor.instructorId]);

    const mailOptions = {
      to: instructor.email,
      subject: 'AIvaluate Password Reset',
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
             Please click on the following link, or paste this into your browser to complete the process within one hour of receiving it:\n\n
             http://localhost:5173/eval/resetpassword/${token}\n\n
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
    const result = await pool.query('SELECT * FROM "Instructor" WHERE "resetPasswordToken" = $1 AND "resetPasswordExpires" > NOW()', [req.params.token]);
    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
    }

    const instructor = result.rows[0];
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query('UPDATE "Instructor" SET "password" = $1, "resetPasswordToken" = $2, "resetPasswordExpires" = $3 WHERE "instructorId" = $4', [hashedPassword, null, null, instructor.instructorId]);

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Error during password reset:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/teaches', async (req, res) => {
  const { courseId, instructorId } = req.body;
  try {
    await pool.query('INSERT INTO "Teaches" ("courseId", "instructorId") VALUES ($1, $2)', [courseId, instructorId]);
    res.status(201).send({ message: 'Instructor/TA added to course successfully' });
  } catch (error) {
    console.error('Error adding Instructor/TA to course:', error);
    res.status(500).send({ message: 'Error adding Instructor/TA to course' });
  }
});

// Route to get current evaluator's ID from session
router.get('/instructor/me', (req, res) => {
  if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
  }
  res.status(200).json({ instructorId: req.user.instructorId });
});

// Route to get evaluator firstName by instructorId
router.get('/instructor/:instructorId/firstName', async (req, res) => {
  const instructorId = parseInt(req.params.instructorId);

  try {
      const result = await pool.query('SELECT "firstName" FROM "Instructor" WHERE "instructorId" = $1', [instructorId]);
      if (result.rows.length === 0) {
          return res.status(404).json({ message: 'Instructor not found' });
      }
      res.status(200).json({ firstName: result.rows[0].firstName });
  } catch (error) {
      console.error('Error fetching instructor firstName:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});

// Route to get instructor lastName by instructorId
router.get('/instructor/:instructorId/lastName', async (req, res) => {
  const instructorId = parseInt(req.params.instructorId);

  try {
      const result = await pool.query('SELECT "lastName" FROM "Instructor" WHERE "instructorId" = $1', [instructorId]);
      if (result.rows.length === 0) {
          return res.status(404).json({ message: 'Instructor not found' });
      }
      res.status(200).json({ lastName: result.rows[0].lastName });
  } catch (error) {
      console.error('Error fetching instructor lastName:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});

// Route to get instructor email by instructorId
router.get('/instructor/:instructorId/email', async (req, res) => {
  const instructorId = parseInt(req.params.instructorId);

  try {
      const result = await pool.query('SELECT "email" FROM "Instructor" WHERE "instructorId" = $1', [instructorId]);
      if (result.rows.length === 0) {
          return res.status(404).json({ message: 'Instructor not found' });
      }
      res.status(200).json({ email: result.rows[0].email });
  } catch (error) {
      console.error('Error fetching instructor email:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});


// Route to get instructor password by instructorId
router.get('/instructor/:instructorId/password', async (req, res) => {
  const instructorId = parseInt(req.params.instructorId);

  try {
      const result = await pool.query('SELECT "password" FROM "Instructor" WHERE "instructorId" = $1', [instructorId]);
      if (result.rows.length === 0) {
          return res.status(404).json({ message: 'Instructor not found' });
      }
      res.status(200).json({ password: result.rows[0].password });
  } catch (error) {
      console.error('Error fetching instructor password:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});

// Route to verify instructor password by instructorId//
router.post('/instructor/:instructorId/verifyPassword', async (req, res) => {
  const instructorId = parseInt(req.params.instructorId);
  const { currentPassword } = req.body;

  try {
      const result = await pool.query('SELECT "password" FROM "Instructor" WHERE "instructorId" = $1', [instructorId]);
      if (result.rows.length === 0) {
          return res.status(404).json({ message: 'Instructor not found' });
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

// Route to set instructor password by instructorId//
router.put('/instructor/:instructorId/password', async (req, res) => {
  const instructorId = parseInt(req.params.instructorId);
  const { password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
      await pool.query('UPDATE "Instructor" SET "password" = $1 WHERE "instructorId" = $2', [hashedPassword, instructorId]);
      res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
      console.error('Error updating instructor password:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});

// Create a course
router.post('/courses', async (req, res) => {
    const { courseName, courseCode, maxStudents } = req.body;

    console.log(req.body);

    try {
        const result = await pool.query(
            'INSERT INTO "Course" ("courseName", "courseCode", "maxStudents") VALUES ($1, $2, $3) RETURNING "courseId"',
            [courseName, courseCode, maxStudents]
        );
        res.status(201).send({ courseId: result.rows[0].courseId, message: 'Course created successfully' });
    } catch (error) {
        console.error('Error creating course:', error);
        res.status(500).send({ message: 'Error creating course' });
    }
});

// Get all courses
router.get('/courses', async (req, res) => {
    try {
        const courses = await pool.query('SELECT * FROM "Course"');
        res.status(200).send(courses.rows);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).send({ message: 'Error fetching courses' });
    }
});

// Route to get all courses taught by an instructor
router.get('/courses/me/:instructorId', async (req, res) => {
  const instructorId = req.params.instructorId;

  try {
      const result = await pool.query(`
          SELECT 
              C."courseId", 
              C."courseName", 
              C."courseCode", 
              C."isArchived"
          FROM 
              "Teaches" T
          JOIN 
              "Course" C ON C."courseId" = T."courseId"
          WHERE 
              T."instructorId" = $1
      `, [instructorId]);

      // Log the results to verify they meet expectations
      console.log('Fetched Courses:', result.rows);  // Add this log

      res.status(200).json(result.rows); // Ensure this sends an array
  } catch (error) {
      console.error('Error fetching courses:', error);
      res.status(500).send({ message: 'Error fetching courses' });
  }
});
    

// Get all instructors
router.get('/instructors', async (req, res) => {
    try {
        const courses = await pool.query('SELECT * FROM "Instructor" WHERE "isTA" = FALSE');
        res.status(200).send(courses.rows);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).send({ message: 'Error fetching courses' });
    }
});

// Get all TAs
router.get('/tas', async (req, res) => {   
    try {
        const tas = await pool.query('SELECT * FROM "Instructor" WHERE "isTA" = TRUE');
        res.status(200).send(tas.rows);
    } catch (error) {
        console.error('Error fetching TAs:', error);
        res.status(500).send({ message: 'Error fetching TAs' });
    }
});

// Fetch all TAs for a course
router.get('/courses/:id/tas', async (req, res) => {
    const courseId = req.params.id;

    try {
        const tas = await pool.query(`
            SELECT I."instructorId", I."firstName", I."lastName", I."email"
            FROM "Instructor" I
            JOIN "Teaches" T ON I."instructorId" = T."instructorId"
            WHERE T."courseId" = $1 AND I."isTA" = TRUE
        `, [courseId]);

        if (tas.rowCount > 0) {
            res.status(200).send(tas.rows);
        } else {
            // Sending an empty array with a 200 status code instead of treating it as an error
            res.status(200).send([]);
        }
    } catch (error) {
        console.error('Error fetching TAs:', error);
        res.status(500).send({ message: 'Error fetching TAs' });
    }
});

 // remove TA from course
router.delete('/teaches/:courseId/:instructorId', async (req, res) => {
    const { courseId, instructorId } = req.params;

    try {
        await pool.query('DELETE FROM "Teaches" WHERE "courseId" = $1 AND "instructorId" = $2', [courseId, instructorId]);
        res.status(200).json({ message: 'TA removed from course successfully' });
    } catch (error) {
        console.error('Error removing TA from course:', error);
        res.status(500).json({ message: 'Error removing TA from course' });
    }
}
);

// Determine whether the evaluator is a prof or a TA
router.get('/instructor/:id/isTA', async (req, res) => {
    const instructorId = req.params.id;

    try {
        const result = await pool.query('SELECT "isTA" FROM "Instructor" WHERE "instructorId" = $1', [instructorId]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Instructor not found' });
        }

        res.status(200).json({ isTA: result.rows[0].isTA });
    } catch (error) {
        console.error('Error fetching instructor:', error);
        res.status(500).json({ message: 'Error fetching instructor' });
    }
});

module.exports = router;
module.exports.sendMail = sendMail; 