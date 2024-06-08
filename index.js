const express = require('express');
const path = require('path');
const passport = require('passport');
const session = require('express-session');
const app = express();
require('./auth'); // Import your authentication setup

function isloggedin(req, res, next) {
    req.user ? next() : res.sendStatus(401);
}

// Session middleware
app.use(session({
    secret: 'mysecret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use(passport.initialize());
app.set('view engine', 'ejs'); // Set the view engine to ejs
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the "public" directory

// Define routes
app.get('/', (req, res) => {
    res.render('index'); // Render the index.ejs file
});

app.get('/auth/google',
    passport.authenticate('google', { scope: ['email', 'profile'] })
);

app.get('/auth/google/callback',
    passport.authenticate('google', {
        successRedirect: '/auth/google/success',
        failureRedirect: '/auth/google/failure'
    })
);

app.get('/auth/google/failure', (req, res) => {
    res.send("Authentication failed");
});

app.get('/auth/google/success', (req, res) => {
    res.send("Authentication successful");
});

app.get('/auth/protected', isloggedin, (req, res) => {
    let name = req.user.displayName; // Corrected typo from "displayNmae" to "displayName"
    res.send(`Hello ${name}, you are logged in.`);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
