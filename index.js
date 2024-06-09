// index.js
const express = require('express');
const path = require('path');
const passport = require('passport');
const session = require('express-session');
const mysql = require('mysql');
const app = express();
require('dotenv').config(); // Load environment variables

// Create the MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // Replace with your MySQL password
    database: 'mydatabase'
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        process.exit(1);
    }
    console.log('Connected to MySQL');
});

// Import passport setup and authentication
require('./auth')(passport, db);

app.use(session({
    secret: 'mysecret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.render('index');
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

function isLoggedIn(req, res, next) {
    req.user ? next() : res.sendStatus(401);
}

app.get('/auth/protected', isLoggedIn, (req, res) => {
    let name = req.user.display_name;
    res.send(`Hello ${name}, you are logged in.`); // Change to display_name
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
