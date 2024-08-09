require('dotenv').config({ path: '/app/aivaluate/backend-admin/.env' });
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

const adminRoutes = require('./routes/adminRoutes');
const studentRoutes = require('./routes/studentRoutes');
const instructorRoutes = require('./routes/instructorRoutes');
const courseRoutes = require('./routes/courseRoutes');
const initializePassport = require("./passportConfig");

initializePassport(passport);

const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));

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

// Middleware to parse JSON
app.use(express.json());

const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true
};

app.use(cors(corsOptions));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use('/admin-api', adminRoutes);
app.use('/admin-api', studentRoutes);
app.use('/admin-api', instructorRoutes);
app.use('/admin-api', courseRoutes);

app.post("/admin-api/signup", async (req, res) => {
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
            'SELECT * FROM "SystemAdministrator" WHERE email = $1',
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
                        'INSERT INTO "SystemAdministrator" ("firstName", "lastName", email, password) VALUES ($1, $2, $3, $4) RETURNING "adminId", password',
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

app.post("/admin-api/login", passport.authenticate("local", {
    successRedirect: "/admin-api/dashboard",
    failureRedirect: "/admin-api/login",
    failureFlash: true
}));

app.get("/admin-api/dashboard", checkNotAuthenticated, (req, res) => {
    res.json({ user: req.user });
});

app.get('/admin-api/logout', (req, res, next) => {
    console.log('Attempting to logout...'); // Check if this message appears in the console
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
            console.log('Logout successful'); // Check if this message appears in the console
            res.redirect('/admin-api/login');
        });
    });
});

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/admin-api/dashboard');
    }
    next();
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/admin-api/login");
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
