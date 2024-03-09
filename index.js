const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const bcrypt = require('bcrypt');
const session = require('express-session');
const path = require('path');

const db = require('./db.js');
const initialize = require('./initializeDb.js');

const app = express();

app.use(express.static('public'));

initialize().then(() => {
    app.listen(3000, () => {
        console.log('Server is running on port 3000');
    });
}); 




