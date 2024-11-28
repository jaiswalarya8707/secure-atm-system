const email = 'user@example.com';
const otp = '123456'; // The OTP user entered

fetch('/validate-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp })
})
.then(response => response.json())
.then(data => {
    console.log(data.message); // "OTP validated successfully" or "Invalid OTP"
})
.catch(error => console.error('Error:', error));
                            