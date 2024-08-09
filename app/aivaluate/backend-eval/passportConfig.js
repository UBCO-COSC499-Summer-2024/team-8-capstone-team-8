const LocalStrategy = require("passport-local").Strategy;
const { pool } = require("./dbConfig");
const bcrypt = require("bcryptjs");

function initialize(passport) {
  console.log("Initialized");

  const authenticateUser = (email, password, done) => {
    console.log(email, password);
    pool.query(
      `SELECT * FROM "Instructor" WHERE email = $1`,
      [email],
      (err, results) => {
        if (err) {
          throw err;
        }
        console.log(results.rows);

        if (results.rows.length > 0) {
          const user = results.rows[0];

          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
              console.log(err);
            }
            if (isMatch) {
              return done(null, user);
            } else {
              //password is incorrect
              return done(null, false, { message: "Password is incorrect" });
            }
          });
        } else {
          // No user
          return done(null, false, {
            message: "No user with that email address"
          });
        }
      }
    );
  };

  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      authenticateUser
    )
  );

  passport.serializeUser((user, done) => {
    const sessionData = {
      userId: user.instructorId,
      userType: "eval"
    };
    done(null, sessionData);
  });

  passport.deserializeUser((sessionData, done) => {
    pool.query(`SELECT * FROM "Instructor" WHERE "instructorId" = $1`, [sessionData.userId], (err, results) => {
      if (err) {
        return done(err);
      }
      const user = results.rows[0];
      user.userType = sessionData.userType;
      console.log(`ID is ${user.instructorId}`);
      console.log(`User type is ${user.userType}`);
      return done(null, user);
    });
  });
}

module.exports = initialize;
