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
    resave: true,
    saveUninitialized: true,
    secret: "secret"
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));

app.get('/book/:id',function(req,res){

    axios.get(`https://www.googleapis.com/books/v1/volumes/${req.params.id}`)
    .then(function(response){
        res.json({title: response.data.volumeInfo.title, authors: response.data.volumeInfo.authors, description: response.data.volumeInfo.description, image: response.data.volumeInfo.imageLinks.thumbnail})
        return res.end();
    })



});


app.post('/request', async function(req,res){
    await db.history.create({status: "pending", date: new Date(), bookId: req.body.bookId, userId: req.session.userId});
    res.status(200).end();  
})



initialize().then(() => {
    app.listen(3000, () => {
        console.log('Server is running on port 3000');
    });
}); 




