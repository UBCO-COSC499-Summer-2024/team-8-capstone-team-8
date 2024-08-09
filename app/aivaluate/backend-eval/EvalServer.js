const express = require('express');
const app = express();
const cors = require('cors');
const session = require('express-session');
const flash = require("express-flash");
const bodyParser = require('body-parser');
const passport = require("passport");
const courseRoutes = require('./routes/courseRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const instructorRoutes = require('./routes/instructorRoutes');
const gradeRoutes = require('./routes/gradeRoutes');
const studentRoutes = require('./routes/studentRoutes');
const promptRoutes = require('./routes/promptRoutes');
const evalRoutes = require('./routes/evalRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const { pool } = require('./dbConfig');
const { sendMail } = require('./routes/instructorRoutes');
const initializePassport = require("./passportConfig");

initializePassport(passport);

const PORT = process.env.PORT || 6000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
    }
}));

const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true
};

app.use(cors(corsOptions));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use((req, res, next) => {
    console.log('Course ID from body:', req.body.courseId);
    console.log('Course ID from session:', req.session.courseId);
    console.log('Instructor ID from body:', req.body.instructorId);
    console.log('Instructor ID from session:', req.session.instructorId);
    if (!req.session.courseId && req.body.courseId) {
        req.session.courseId = req.body.courseId;
    }
    if (!req.session.instructorId && req.body.instructorId) {
        req.session.instructorId = req.body.instructorId;
    }
    if (!req.session.assignmentId && req.body.assignmentId) {
        req.session.assignmentId = req.body.assignmentId;
    }
    next();
});

// Function to check if user is authenticated (can be used for protected routes)
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next(); // User is authenticated, continue to the next middleware
    }
    res.redirect('/eval-api/login');
}

app.get("/eval-api/dashboard", checkAuthenticated, (req, res) => {
    if (req.isAuthenticated()) {
        req.session.instructorId = req.user.instructorId;
        res.json({ user: req.user });
    } else {
        res.redirect("/eval-api/login");
    }
});

app.use('/eval-api', evalRoutes);
app.use('/eval-api', courseRoutes);
app.use('/eval-api', assignmentRoutes);
app.use('/eval-api', instructorRoutes);
app.use('/eval-api', gradeRoutes);
app.use('/eval-api', studentRoutes);
app.use('/eval-api', promptRoutes);
app.use('/eval-api', submissionRoutes);

app.post("/eval-api/login", passport.authenticate("local", {
    successRedirect: "/eval-api/dashboard",
    failureRedirect: "/eval-api/login",
    failureFlash: true
}));

app.get("/eval-api/dashboard", checkAuthenticated, (req, res) => {
    if (req.isAuthenticated()) {
        req.session.instructorId = req.user.instructorId;
        res.json({ user: req.user });
    } else {
        res.redirect("/eval-api/login");
    }
});

app.get('/eval-api/logout', (req, res, next) => {
    console.log('Attempting to logout...');
    req.logout((err) => {
        if (err) {
            console.error('Logout error:', err);
            return next(err);
        }
        req.flash('success_msg', "You have successfully logged out");
        req.session.destroy((err) => {
            if (err) {
                console.error('Session destroy error:', err);
                return next(err);
            }
            res.clearCookie('connect.sid');
            console.log('Logout successful');
            res.redirect('/eval-api/login');
        });
    });
});

app.post('/eval-api/set-course', (req, res) => {
    const { courseId, instructorId } = req.body;
    if (!courseId || !instructorId) {
        return res.status(400).json({ message: 'Course ID and Instructor ID are required' });
    }
    req.session.courseId = courseId;
    req.session.instructorId = instructorId;
    res.status(200).json({ message: 'Course ID and Instructor ID set in session', courseId, instructorId });
});

app.post('/eval-api/set-course-only', (req, res) => {
    const { courseId } = req.body;
    if (!courseId) {
        return res.status(400).json({ message: 'Course ID is required' });
    }
    req.session.courseId = courseId;
    res.status(200).json({ message: 'Course ID set in session', courseId });
});

app.post('/eval-api/set-session', (req, res) => {
    const { instructorId, courseId } = req.body;
    if (!instructorId || !courseId) {
        return res.status(400).json({ message: 'Instructor ID and Course ID are required' });
    }
    req.session.instructorId = instructorId;
    req.session.courseId = courseId;
    res.status(200).json({ message: 'Session variables set successfully' });
  });

function ensureCourseAndInstructor(req, res, next) {
    if (!req.session.courseId || !req.session.instructorId) {
        return res.status(400).json({ message: 'Course ID and Instructor ID must be set in session' });
    }
    next();
}

async function sendAssignmentCreationEmails(courseId, assignmentId) {
    try {
        const result = await pool.query(
            `SELECT s."email"
             FROM "Student" s
             JOIN "EnrolledIn" e ON s."studentId" = e."studentId"
             WHERE e."courseId" = $1`,
            [courseId]
        );
        
        const assignmentResult = await pool.query(
            `SELECT "assignmentName", "dueDate", "assignmentDescription", "maxObtainableGrade"
             FROM "Assignment"
             WHERE "assignmentId" = $1`,
            [assignmentId]
        );
        const assignment = assignmentResult.rows[0];
        const courseResult = await pool.query(
            `SELECT "courseName", "courseCode"
             FROM "Course"
             WHERE "courseId" = $1`,
            [courseId]
        );
        const course = courseResult.rows[0];
        const dueDate = new Date(assignment.dueDate);
        const formattedDate = dueDate.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });

        const formattedTime = dueDate.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });

        const formattedDueDate = `${formattedDate} at ${formattedTime}`;
        const subject = `📝 New Assignment: ${assignment.assignmentName} has been created`;
        const text = `
📅  Assignment Created 📅 

A new assignment has been created in the course ${course.courseCode}: ${course.courseName}. Here are the details:

📚 Assignment: ${assignment.assignmentName}

📅 Due Date: ${formattedDueDate}

---

✨ Tips for Success: ✨

- 📅 Mark the due date on your calendar.
- ⏰ Manage your time effectively.
- 📝 Review the assignment requirements carefully.
- 💡 Start early to ensure you have ample time for resubmitting if you need to.

You can access the assignment by logging into your AIvaluate account. Be sure to submit your work before the due date, good luck!

Best regards,
The AIvaluate Team
        `;

        for (let row of result.rows) {
            await sendMail(row.email, subject, text);
        }
        console.log(`Emails sent to all students for assignment ID ${assignmentId}`);
    } catch (error) {
        console.error('Error sending assignment creation emails:', error);
    }
}

async function sendAssignmentGradedEmail(payload) {
    const { email, courseName, assignmentName } = payload;
    const subject = `📊 Your assignment has been graded in ${courseName}`;
    const text = `
    ${assignmentName} in the course ${courseName} has been graded.

    Please log in to your AIvaluate account to view your grade and feedback.

    Best regards,
    The AIvaluate Team
    `;

    try {
        await sendMail(email, subject, text);
        console.log(`Email sent to ${email} for graded assignment.`);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

app.use('/eval-api', ensureCourseAndInstructor, assignmentRoutes);
app.use('/eval-api/rubrics', ensureCourseAndInstructor, courseRoutes);
app.use('/eval-api/assignments', ensureCourseAndInstructor, assignmentRoutes);
app.use('/eval-api', evalRoutes);
app.use('/eval-api', instructorRoutes);
app.use('/eval-api', gradeRoutes);
app.use('/eval-api', studentRoutes);
app.use('/eval-api', promptRoutes);
app.use('/eval-api', submissionRoutes);

async function listenForAssignmentCreation() {
    const client = await pool.connect();
    client.on('notification', async (msg) => {
        if (msg.channel === 'assignment_created') {
            const payload = JSON.parse(msg.payload);
            console.log('Assignment Created:', payload);
            sendAssignmentCreationEmails(payload.courseId, payload.assignmentId);
        }
    });

    await client.query('LISTEN assignment_created');
}

async function listenForAssignmentGrading() {
    const client = await pool.connect();
    client.on('notification', async (msg) => {
        if (msg.channel === 'assignment_graded') {
            const payload = JSON.parse(msg.payload);
            console.log('Assignment Graded:', payload);
            await sendAssignmentGradedEmail(payload);
        }
    });

    await client.query('LISTEN assignment_graded');
}

listenForAssignmentCreation();

listenForAssignmentGrading();

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});