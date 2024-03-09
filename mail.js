const nodemailer = require('nodemailer');
require('dotenv').config();

var transporter = nodemailer.createTransport({
    service
        : 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    }
});

function sendMail(from, to, subject, text) {
    var mailOptions = {
        "from": from,
        "to": to,
        "subject": subject,
        "text": text
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    }
    );
}

/*
    const from = 'emir.agovic13@gmail.com';
    const to = 'eagovic1@etf.unsa.ba';
    const subject = 'Test Email';
    const text = 'This is a test email sent via Node.js and Nodemailer.';

    sendMail(from, to, subject, text);
*/

module.exports = { sendMail };