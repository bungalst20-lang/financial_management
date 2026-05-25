require('dotenv').config();

const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/auth', require('./routes/authRoutes'));
app.use('/transactions', require('./routes/transactionRoutes'));
app.use('/categories', require('./routes/categoryRoutes'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/pages/login.html'));
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});