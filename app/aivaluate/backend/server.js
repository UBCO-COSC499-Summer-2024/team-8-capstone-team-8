const express = require('express');
const path = require('path');
const app = express();
const cors = require('cors');
const { pool } = require('./dbConfig');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const flash = require("express-flash");
const bodyParser = require('body-parser');
const passport = require("passport");
const courseRoutes = require('./routes/courseRoutes');
const studentRoutes = require('./routes/studentRoutes');
const instructorRoutes = require('./routes/instructorRoutes');

const initializePassport = require("./passportConfig");

initializePassport(passport);

const PORT = process.env.PORT || 4000;

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
  }));

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 

app.use(
    session({
        secret: 'secret',
        resave: false,
        saveUninitialized: false
    })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(courseRoutes);
app.use(studentRoutes);
app.use(instructorRoutes);

app.post("/stu/signup", async (req, res) => {
    let { firstName, lastName, email, password, password2 } = req.body;

    let errors = [];

    if (!firstName || !lastName || !email || !password || !password2) {
        errors.push({ message: "Please enter all fields" });
    }

    if (password.length < 6) {
        errors.push({ message: "Password should be at least 6 characters long" });
    }

    if (password != password2) {
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

app.post("/stu/login", passport.authenticate("local", {
    successRedirect: "/stu/dashboard",
    failureRedirect: "/stu/login",
    failureFlash: true
}));

app.get("/stu/dashboard", checkNotAuthenticated, (req, res) => {
    res.json({ user: req.user });
});

app.get('/stu/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash('success_msg', "You have successfully logged out");
        req.session.destroy((err) => {
            if (err) {
                return next(err);
            }
            res.clearCookie('connect.sid');
            res.redirect('/stu/login');
        });
    });
});

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/stu/dashboard');
    }
    next();
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/stu/login");
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
