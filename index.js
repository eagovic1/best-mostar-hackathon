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


app.use(session({
    secret: '123456',
    resave: false,
    saveUninitialized: true
}));

app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/book/:id', function (req, res) {
    res.json(getBookById(req.params.id));
});

app.post('/login', function (req, res) {
    const { email, password } = req.body;
    db.user.findOne({ where: { email: email } }).then(user => {
        if (user && password == user.password) {
            req.session.user = user;
            res.json(user);
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    });
});

app.post('/logout', function (req, res) {
    req.session.destroy();
    res.json({ success: true });
});

app.post('/request/book', function (req, res) {
    if (req.session.user) {
        const { bookId, bookName } = req.body;
        db.history.findOne({ where: { UserId: req.session.user.id, status: 'pending' } }).then(request => {
            if (request) {
                return res.status(400).json({ error: 'Request already pending' });
            } else {
                db.history.create({ status: 'pending', date: new Date(), bookId: bookId, UserId: req.session.user.id }).then(request => {
                    notifyTeacher("eagovic1@etf.unsa.ba", req.session.user.name, bookName);
                    return res.status(200).json({ success: true });
                });
            }
        });
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
});


app.put('/request/book/status', function (req, res) {
    if (req.session.user && req.session.user.role == 'teacher') {
        const { requestId, status } = req.body;
        if (!["approved", "rejected", "pending"].includes(status))
            return res.status(400).json({ error: 'Invalid status' });
        db.history.update({ status: status }, { where: { id: requestId } }).then(async request => {
            db.history.findByPk(requestId).then(async updatedRequest => {
                let bookId = updatedRequest["bookId"];
                let book = await getBookById(bookId);
                let bookName = book.title;
                notifyStudent("eagovic1@etf.unsa.ba", bookName, status);
                return res.status(200).json({ success: true });
            });

        });
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
});

async function getBookById(id) {
    let book = await axios.get(`https://www.googleapis.com/books/v1/volumes/${id}`)
        .then(function (response) {
            return {
                title: response.data.volumeInfo.title,
                authors: response.data.volumeInfo.authors,
                description: response.data.volumeInfo.description,
                image: response.data.volumeInfo.imageLinks.thumbnail
            }
        })
    console.log(book);
    return book;
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




