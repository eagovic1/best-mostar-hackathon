const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const bcrypt = require('bcrypt');
const session = require('express-session');
const path = require('path');
const axios = require('axios');
const db = require('./db.js');
const initialize = require('./initializeDb.js');
const dotenv = require('dotenv');

dotenv.config();
const app = express();


const OpenAI = require('openai');
const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});


app.use(express.static('public'));

app.get('/book/:id', function (req, res) {
    res.json(getBookById(req.params.id));
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


app.get('/book/search/:name', async function (req, res) {

    let response = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${req.params.name}`);

  

    let books = response.data.items;

    let uniqueBooks = [];

   for(let i=0;i<books.length;i++){
         let unique = true;
         for(let j=0;j<uniqueBooks.length;j++){
              if(uniqueBooks[j].volumeInfo.title.toLowerCase() === books[i].volumeInfo.title.toLowerCase() || books[i].volumeInfo.title.toLowerCase().includes(uniqueBooks[j].volumeInfo.title.toLowerCase())){
                unique = false;
                break;
              }
         }
         if(unique){
              uniqueBooks.push(books[i]);
         }
    }
    
    
    uniqueBooks.forEach(element => {
        console.log(element.volumeInfo.title)
    });

    res.json(uniqueBooks);
    return res.end();
    

   // let books = response.data.items.foreach(book => {})
  //  console.log('č'.toLowerCase());
   
})

app.get('/quiz/:id',async function (req, res) {

    let bookInfo = await axios.get(`https://www.googleapis.com/books/v1/volumes/${req.params.id}`)
    
    let name = bookInfo.data.volumeInfo.title;  

    const prompt = "Create long summary of the book and a quiz for the book " + name + "in English language with 5 detailed questions from easiest to hardest, give long answers to questions in JSON format, give questions only about the plot of the book. Like this {\"summary\": \"answer\",\"questions\": [{\"question\": \"Question\", \"answer\": \"Your answer\"}, {\"question\": \"Question\", \"answer\": \"Your answer\"}]}";

    //const prompt = "Create one"


    const stream = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: `${prompt}` }],
    });

    const quiz = JSON.parse(stream.choices[0].message.content);
    res.json(quiz);

});



initialize().then(() => {
    app.listen(3000, () => {
        console.log('Server is running on port 3000');
    });
});




