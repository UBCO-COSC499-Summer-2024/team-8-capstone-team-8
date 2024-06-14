const express = require('express');
const app = express();
const cors = require('cors');
const { pool } = require('./dbConfig');
const bcrypt = require('bcrypt');
const session = require('express-session');
const flash = require("express-flash");
const passport = require("passport");

const initializePassport = require("./passportConfig");
const login = require("./login-backend");

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

initializePassport(passport);

const PORT = process.env.PORT || 4000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

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
app.use(login);

app.get('/', (req, res) => {
  res.render("/login");
});

app.get('/signup', checkAuthenticated, (req, res) => {
  res.render("signup");
});

app.get("/login", checkAuthenticated, (req, res) => {
  res.render("login", { messages: req.flash() });
});

app.get("/dashboard", checkNotAuthenticated, (req, res) => {
  res.render("dashboard", { user: req.user });
});

app.get('/logout', (req, res, next) => {
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
      res.redirect('/login');
    });
  });
});

app.post("/signup", async (req, res) => {
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
    res.render("register", { errors });
  } else {
    let hashedPassword = await bcrypt.hash(password, 10);

    pool.query(
      'SELECT * FROM "Student" WHERE email = $1',
      [email],
      (err, results) => {
        if (err) {
          console.error('Error during SELECT:', err);
          return res.render('register', { errors: [{ message: "Database error" }] });
        }

        if (results.rows.length > 0) {
          errors.push({ message: "Email already registered" });
          res.render('register', { errors });
        } else {
          pool.query(
            'INSERT INTO "Student" ("firstName", "lastName", email, password) VALUES ($1, $2, $3, $4) RETURNING "studentId", password',
            [firstName, lastName, email, hashedPassword],
            (err, results) => {
              if (err) {
                console.error('Error during INSERT:', err);
                return res.render('register', { errors: [{ message: "Database error" }] });
              }
              req.flash('success_msg', "You are now registered. Please log in");
              res.redirect('/login');
            }
          );
        }
      }
    );
  }
});

app.post("/login", passport.authenticate("local", {
  successRedirect: "/dashboard",
  failureRedirect: "/login",
  failureFlash: true
}));

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/dashboard');
  }
  next();
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
