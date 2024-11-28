const express = require('express');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Multer setup to store uploaded files
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));

// Handle file upload and card scanning
app.post('/scan-card', upload.single('cardImage'), (req, res) => {
    if (!req.file) {
        return res.status(400).send("No file uploaded");
    }

    const filePath = path.join(__dirname, req.file.path);

    // Use Tesseract.js to extract card details from the uploaded image
    Tesseract.recognize(filePath, 'eng', {
        logger: m => console.log(m),
    })
    .then(({ data: { text } }) => {
        // Process and validate extracted card details
        const cardDetails = extractCardDetails(text);

        if (cardDetails) {
            // Respond with card details (you could also store or process this data further)
            res.json({ cardDetails });
        } else {
            res.status(400).send('Failed to extract valid card details');
        }

        // Remove uploaded file after processing
        fs.unlink(filePath, (err) => {
            if (err) console.error("Failed to delete temp file:", err);
        });
    })
    .catch(err => {
        console.error("Error scanning card:", err);
        res.status(500).send('Error scanning card');
    });
});

// Helper function to extract card details from OCR text
function extractCardDetails(text) {
    const cardNumberPattern = /\b(?:\d[ -]*?){13,16}\b/;  // Simple regex for credit card numbers
    const expiryPattern = /\b(0[1-9]|1[0-2])\/([0-9]{2})\b/; // MM/YY format

    const cardNumber = text.match(cardNumberPattern);
    const expiryDate = text.match(expiryPattern);

    if (cardNumber && expiryDate) {
        return {
            cardNumber: cardNumber[0],
            expiryDate: expiryDate[0]
        };
    }
    return null;
}

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
