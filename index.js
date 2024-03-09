const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const axios = require('axios');
const db = require('./db.js');
const initialize = require('./initializeDb.js');
const dotenv = require('dotenv');



dotenv.config();
const app = express();

app.use(bodyParser.json());
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(express.static('public'));
app.use(express.static('public/html'));

app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: "secret"
}));

/**
 * User login and registration
 */
app.post('/register', function (req, res) {
    const { name, surname, email, password, role } = req.body;
    db.user.findOne({ where: { email: email } }).then(user => {
        if (user) {
            res.status(400).json({ error: 'User already exists' });
        } else {
            db.user.create({ name: name, surname: surname, email: email, password: password, role: role }).then(user => {
                res.status(200).json({ success: true });
            });
        }
    });
}
);

app.post('/login', function (req, res) {
    const { email, password } = req.body;
    db.user.findOne({ where: { email: email } }).then(user => {
        if (user && password == user.password) {
            req.session.user = user;
            req.session.userId = user.userId;
            res.status(200).json({ success: true });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    });
});

app.post('/logout', function (req, res) {
    req.session.destroy();
    res.status(200).json({ success: true });
});


/**
 * Book detail search
 */
async function getBookById(id) {
    let book = await axios.get(`https://www.googleapis.com/books/v1/volumes/${id}`)
        .then(function (response) {
            return {
                title: response.data.volumeInfo.title,
                authors: response.data.volumeInfo.authors,
                description: response.data.volumeInfo.description,
                image: response.data.volumeInfo.imageLinks.thumbnail
            }
        }).catch(function (error) {
            console.log(error);
            return { error: 'Book not found'};
        });
    return book;
}

async function getBooksByTitle(title) {
    let booksResponse = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${title}`)

    return booksResponse;
}

app.get('/book/:id', function (req, res) {
    res.json(getBookById(req.params.id));
});

app.get('/books/:name', async function (req, res) {
    //let response = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${req.params.name}`);
    let response = await getBooksByTitle(req.params.name);
    let books = response.data.items;

    let uniqueBooks = [];

    for (let i = 0; i < books.length; i++) {
        let unique = true;
        for (let j = 0; j < uniqueBooks.length; j++) {
            if (uniqueBooks[j].volumeInfo.title.toLowerCase() === books[i].volumeInfo.title.toLowerCase() || books[i].volumeInfo.title.toLowerCase().includes(uniqueBooks[j].volumeInfo.title.toLowerCase())) {
                unique = false;
                break;
            }
        }
        if (unique) {
            uniqueBooks.push(books[i]);
        }
    }
    uniqueBooks.forEach(element => {
        console.log(element.volumeInfo.title)
    });

    res.json(uniqueBooks);
    return res.end();
})

app.post('/books/params', async (req, res) => {
    const { genre, difficulty, length, interests } = req.body;
    const prompt = "Give me recommendations for 5 books based on these parameters. Genre: " + genre + ". Difficulty: " + difficulty + ". Length: " + length + ". Also, my all around interests are:" + interests + " Give me response in JSON format" +
        "Like this {\"books\": [{\"title: Title\", \"author\": author, \"summary\": summary}, {\"title: Title\", \"author\": author, \"summary\": summary}]}. Summary should be a bit longer. Dont put anything else in response besides this js file";
    const stream = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: `${prompt}` }],
    });
    const books = JSON.parse(stream.choices[0].message.content);

    let final_books = [];
    for (const book of books.books) {
        const google_response = await getBooksByTitle(book.title);
        if (!google_response.data.items[0].volumeInfo.imageLinks || !google_response.data.items[0].volumeInfo.imageLinks.thumbnail) continue;
        const bookWithImage = {
            ...book,
            image: google_response.data.items[0].volumeInfo.imageLinks.thumbnail
        };
        final_books.push(bookWithImage);
    }
    res.json(final_books);
});


/**
 * Book request history
 */
async function getBooksFromRequests(requests) {
    let books = [];
    for (let request of requests)
        books.push(await getBookById(request.bookId));
    return books;
}

app.get('/history/all', function (req, res) {
    if (req.session.user && req.session.user.role == 'student') {
        db.history.findAll({ where: { UserId: req.session.user.id } }).then(async requests => {
            res.json(await getBooksFromRequests(requests));
        });
    } else if (req.session.user && req.session.user.role == 'teacher') {
        db.history.findAll().then(async requests => {
            res.json(await getBooksFromRequests(requests));
        });
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
});

app.get('/history/approved', async function (req, res) {
    if (req.session.user && req.session.user.role == 'student') {
        db.history.findAll({ where: { UserId: req.session.user.id, status: "approved" } }).then(async requests => {
            res.json(await getBooksFromRequests(requests));
        });
    } else if (req.session.user && req.session.user.role == 'teacher') {
        db.history.findAll({ where: { status: "approved" } }).then(async requests => {
            res.json(await getBooksFromRequests(requests));
        });
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
});

app.get('/history/ongoing', async function (req, res) {
    if (req.session != null && req.session.user && req.session.user.role == 'student') {
        db.history.findAll({ where: { UserId: req.session.user.id, status: "approved", graded: false } }).then(async requests => {
            res.json(await getBooksFromRequests(requests));
        });
    } else if (req.session != null && req.session.user && req.session.user.role == 'teacher') {
        db.history.findAll({ where: { status: "approved", graded: false } }).then(async requests => {
            res.json(await getBooksFromRequests(requests));
        });
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
});

app.get('/history/graded', async function (req, res) {

    if (req.session.user && req.session.user.role == 'student') {
        db.history.findAll({ where: { UserId: req.session.user.id, graded: true } }).then(async requests => {
            res.json(await getBooksFromRequests(requests));
        });
    } else if (req.session.user && req.session.user.role == 'teacher') {
        db.history.findAll({ where: { graded: true } }).then(async requests => {
            res.json(await getBooksFromRequests(requests));
        });
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
});


/**
 * Sending / modyfing requests
 */
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

app.post('/request/book', function (req, res) {
    if (req.session.user) {
        const { bookId } = req.body;
        db.history.findOne({ where: { UserId: req.session.user.id, status: 'pending' } }).then(async request => {
            if (request) {
                return res.status(400).json({ error: 'Request already pending' });
            } else {
                let bookName = await getBookById(bookId).title;
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


/**
 * Quiz generation
 */
app.get('/quiz/:id', async function (req, res) {
    let bookInfo = await getBookById(req.params.id);
    let name = bookInfo.data.volumeInfo.title;
    const prompt = "Create long summary of the book and a quiz for the book " + name + "in English language with 5 detailed questions from easiest to hardest, give long answers to questions in JSON format, give questions only about the plot of the book. Like this {\"summary\": \"answer\",\"questions\": [{\"question\": \"Question\", \"answer\": \"Your answer\"}, {\"question\": \"Question\", \"answer\": \"Your answer\"}]}";
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