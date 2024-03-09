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

app.get('/book/:id',function(req,res){

    axios.get(`https://www.googleapis.com/books/v1/volumes/${req.params.id}`)
    .then(function(response){
        res.json({title: response.data.volumeInfo.title, authors: response.data.volumeInfo.authors, description: response.data.volumeInfo.description, image: response.data.volumeInfo.imageLinks.thumbnail})
        return res.end();
    })



});



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




