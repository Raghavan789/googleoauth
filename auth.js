// auth.js
const GoogleStrategy = require('passport-google-oauth2').Strategy;

module.exports = function(passport, db) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/google/callback",
        passReqToCallback: true
    },
    function(request, accessToken, refreshToken, profile, done) {
        const { id, displayName, email } = profile;
        db.query('SELECT * FROM users WHERE google_id = ?', [id], (err, results) => {
            if (err) {
                return done(err);
            }
            if (results.length > 0) {
                return done(null, results[0]);
            } else {
                const user = { google_id: id, display_name: displayName, email }; // Change to display_name
                db.query('INSERT INTO users SET ?', user, (err, results) => {
                    if (err) {
                        return done(err);
                    }
                    user.id = results.insertId;
                    return done(null, user);
                });
            }
        });
    }
    ));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        db.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
            if (err) {
                return done(err);
            }
            done(null, results[0]);
        });
    });
};
