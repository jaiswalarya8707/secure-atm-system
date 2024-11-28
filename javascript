const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

let generatedOTP = null;

// Configure Nodemailer to send OTP emails (this is just an example)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'your-email@gmail.com', // Replace with your email
        pass: 'your-email-password'   // Replace with your email password
    }
});

// Send OTP to user
app.get('/', (req, res) => {
    generatedOTP = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP

    // Send OTP via email (replace this with SMS API integration if needed)
    const mailOptions = {
        from: 'your-email@gmail.com',
        to: 'user-email@gmail.com', // Replace with the user's email
        subject: 'Your OTP Code',
        text: `Your OTP is ${generatedOTP}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            res.send('Error sending OTP. Please try again.');
        } else {
            res.sendFile(__dirname + '/index.html'); // Serve the HTML file
        }
    });
});

// Verify OTP
app.post('/verify-otp', (req, res) => {
    const userOTP = req.body.otp;

    if (parseInt(userOTP) === generatedOTP) {
        res.send('OTP verified successfully. You can now proceed.');
    } else {
        res.send('Invalid OTP. Please try again.');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
