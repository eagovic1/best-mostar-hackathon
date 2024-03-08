const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const bcrypt = require('bcrypt');
const session = require('express-session');
const path = require('path');


const app = express();

app.use(express.static('public'));

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});


