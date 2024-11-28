const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware to parse incoming JSON requests
app.use(bodyParser.json());

// Store OTP and expiration time in memory (for simplicity)
let otpStorage = {};

// Generate OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
}

// Send OTP via Email (using Nodemailer)
function sendOtpEmail(email, otp) {
    // Replace with your email configuration
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'your-email@gmail.com', // Replace with your email
            pass: 'your-email-password'   // Replace with your email password or app-specific password
        }
    });

    const mailOptions = {
        from: 'your-email@gmail.com',
        to: email,
        subject: 'Your ATM OTP',
        text: `Your OTP for the transaction is: ${otp}. It will expire in 5 minutes.`
    };

    return transporter.sendMail(mailOptions);
}

// Generate and Send OTP
app.post('/generate-otp', (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    // Generate a new OTP
    const otp = generateOTP();

    // Store the OTP with expiration (5 minutes)
    otpStorage[email] = {
        otp: otp,
        expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes in milliseconds
    };

    // Send the OTP via email
    sendOtpEmail(email, otp)
        .then(() => {
            res.json({ message: 'OTP sent to your email.' });
        })
        .catch((error) => {
            console.error('Error sending OTP:', error);
            res.status(500).json({ message: 'Error sending OTP' });
        });
});

// Validate OTP
app.post('/validate-otp', (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ message: "Email and OTP are required" });
    }

    const storedOtpData = otpStorage[email];

    if (!storedOtpData) {
        return res.status(400).json({ message: "No OTP generated for this email" });
    }

    const { otp: storedOtp, expiresAt } = storedOtpData;

    if (Date.now() > expiresAt) {
        return res.status(400).json({ message: "OTP has expired" });
    }

    if (storedOtp !== parseInt(otp)) {
        return res.status(400).json({ message: "Invalid OTP" });
    }

    // OTP is valid
    res.json({ message: "OTP validated successfully" });

    // Remove the OTP after validation
    delete otpStorage[email];
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
