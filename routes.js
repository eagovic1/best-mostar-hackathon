const express = require('express');
require('dotenv').config();
const bodyParser = require('body-parser');
const axios = require('axios');
const OpenAI = require('openai');
const openai = new OpenAI({
   apiKey: process.env.OPENAI_API_KEY,
});

const app = express();
const port = 3000;
app.use(express.json());

app.post('/search/books', async (req, res) => {
    const { genre, difficulty, length } = req.body;
    const prompt = "Give me recommendations for 5 books based on these parameters. Genre: " + genre + ". Difficulty: " + difficulty + ". Length: " + length + ". Give me response in JSON format" +
        "Like this {\"books\": [{\"title: Title\", \"author\": author}, {\"title: Title\", \"author\": author}]}. Dont put anything else in response besides this js file";
    const stream = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: `${prompt}` }],
    });
    const books = JSON.parse(stream.choices[0].message.content);

    let final_books = [];
    for (const book of books.books) {
        const google_response = await axios.get('https://www.googleapis.com/books/v1/volumes', {
            params: {
                q: book.title
            }
        });
        if (!google_response.data.items[0].volumeInfo.imageLinks || !google_response.data.items[0].volumeInfo.imageLinks.thumbnail) continue;
        const bookWithImage = {
            ...book,
            image: google_response.data.items[0].volumeInfo.imageLinks.thumbnail
        };
        final_books.push(bookWithImage);
    }
    res.json(final_books);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});