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

module.exports = router;