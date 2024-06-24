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

const evalRoutes = require('./routes/evalRoutes');
const initializePassport = require("./passportConfig");

initializePassport(passport);

const PORT = process.env.PORT || 2000;

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

app.use('/eval-api', evalRoutes);

app.post("/eval-api/signup", async (req, res) => {
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
            'SELECT * FROM "Instructor" WHERE email = $1',
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
                        'INSERT INTO "Instructor" ("firstName", "lastName", email, password) VALUES ($1, $2, $3, $4) RETURNING "instructorId", password',
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

app.post("/eval-api/login", passport.authenticate("local", {
    successRedirect: "/eval-api/dashboard",
    failureRedirect: "/eval-api/login",
    failureFlash: true
}));

app.get("/eval-api/dashboard", checkNotAuthenticated, (req, res) => {
    res.json({ user: req.user });
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

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/eval-api/dashboard');
    }
    next();
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/eval-api/login");
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
