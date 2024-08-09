require('dotenv').config({ path: '/app/aivaluate/backend/.env' });
const express = require('express');
const app = express();
const cors = require('cors');
const { pool } = require('./dbConfig');
const bcrypt = require('bcryptjs'); //possible require('bcryptjs')
const session = require('express-session');
const flash = require("express-flash");
const bodyParser = require('body-parser');
const passport = require("passport");
const courseRoutes = require('./routes/courseRoutes');
const studentRoutes = require('./routes/studentRoutes');
const instructorRoutes = require('./routes/instructorRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const gradeRoutes = require('./routes/gradeRoutes');

const initializePassport = require("./passportConfig");

initializePassport(passport);

const PORT = process.env.PORT || 4000;

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
  }));

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
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
}));



// Test route
app.get('/', (req, res) => {
    if (req.session.views) {
        req.session.views++;
        res.send(`Number of views: ${req.session.views}`);
    } else {
        req.session.views = 1;
        res.send('Welcome to the session demo. Refresh!');
    }
});

const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true
};

app.use(cors(corsOptions));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use('/stu-api', courseRoutes);
app.use('/stu-api', studentRoutes);
app.use('/stu-api', instructorRoutes);
app.use('/stu-api', assignmentRoutes);
app.use('/stu-api', gradeRoutes);

app.post("/stu-api/signup", async (req, res) => {
    let { firstName, lastName, email, password, password2 } = req.body;

    let errors = [];

    if (!firstName || !lastName || !email || !password || !password2) {
        errors.push({ message: "Please enter all fields" });
    }

    if (password.length < 6) {
        errors.push({ message: "Password should be at least 6 characters long" });
    }

    if (password !== password2) {
        errors.push({ message: "Passwords do not match" });
    }

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    } else {
        let hashedPassword = await bcrypt.hash(password, 10);

        pool.query(
            'SELECT * FROM "Student" WHERE email = $1',
            [email],
            (err, results) => {
                if (err) {
                    console.error('Error during SELECT:', err);
                    return res.status(500).json({ errors: [{ message: "Database error" }] });
                }

                if (results.rows.length > 0) {
                    errors.push({ message: "Email already registered" });
                    return res.status(400).json({ errors });
                } else {
                    pool.query(
                        'INSERT INTO "Student" ("firstName", "lastName", email, password) VALUES ($1, $2, $3, $4) RETURNING "studentId", password',
                        [firstName, lastName, email, hashedPassword],
                        (err, results) => {
                            if (err) {
                                console.error('Error during INSERT:', err);
                                return res.status(500).json({ errors: [{ message: "Database error" }] });
                            }
                            res.status(201).json({ message: "You are now registered. Please log in" });
                        }
                    );
                }
            }
        );
    }
});

app.post("/stu-api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            req.session.studentId = user.studentId; // Set the studentId in the session
            return res.redirect("/stu-api/dashboard");
        });
    })(req, res, next);
});

app.get("/stu-api/dashboard", checkNotAuthenticated, (req, res) => {
    res.json({ user: req.user });
});

app.get('/stu-api/logout', (req, res, next) => {
    console.log('Attempting to logout...'); // Check if this message appears in the console
    req.logout((err) => {
        if (err) {
            console.error('Logout error:', err); // Check if any logout error is logged
            return next(err);
        }
        req.flash('success_msg', "You have successfully logged out");
        req.session.destroy((err) => {
            if (err) {
                console.error('Session destroy error:', err); // Check if any session destroy error is logged
                return next(err);
            }
            res.clearCookie('connect.sid');
            console.log('Logout successful'); // Check if this message appears in the console
            res.redirect('/stu-api/login');
        });
    });
});

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/stu-api/login");
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
