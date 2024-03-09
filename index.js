const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const bcrypt = require('bcrypt');
const session = require('express-session');
const path = require('path');
const axios = require('axios');
const db = require('./db.js');
const initialize = require('./initializeDb.js');

const app = express();

app.use(express.static('public'));

app.get('/book/:id', function (req, res) {
    res.json(getBookById(req.params.id));
});

app.post('/login', function (req, res) {
    const { email, password } = req.body;
    db.user.findOne({ where: { email: email } }).then(user => {
        if (user && password == user.password) {
            req.session.user = user;
            res.json({ user: user });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    });
});

app.post('/logout', function (req, res) {
    req.session.destroy();
    res.json({ success: true });
});

function getBookById(id) {
    axios.get(`https://www.googleapis.com/books/v1/volumes/${req.params.id}`)
        .then(function (response) {
            return {
                title: response.data.volumeInfo.title,
                authors: response.data.volumeInfo.authors,
                description: response.data.volumeInfo.description,
                image: response.data.volumeInfo.imageLinks.thumbnail
            }
        })
}

const { sendMail } = require('./mail');

function notifyTeacher(teacherMail, userName, bookName) {
    let from = "emir.agovic13@gmail.com";
    let to = teacherMail;
    let subject = "New book request";
    sendMail(from, to, subject, `Student ${userName} has made a request for the book ${bookName}!`);
}

function notifyStudent(studentMail, bookName, status) {
    let from = "emir.agovic13@gmail.com";
    let to = studentMail;
    let subject = "New book request";
    sendMail(from, to, subject, `Teacher has changed the status of your request for the book ${bookName} to ${status}!`);
}

initialize().then(() => {
    app.listen(3000, () => {
        console.log('Server is running on port 3000');
    });
});




