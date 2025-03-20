// server.js - Express.js Backend for Contact Form Processing

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const { check, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// Initialize Express app
const app = express();
const port = process.env.PORT || 3001;

// Security enhancements
app.use(helmet());

// Enable CORS - Configure for your specific domain in production
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://your-website-domain.com' 
    : 'http://localhost:3000',
  optionsSuccessStatus: 200
}));

// Parse JSON request body
app.use(bodyParser.json());

// Rate limiting to prevent abuse
const contactFormLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});

// Create email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // or use another provider with appropriate config
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-email-password'
  }
});

// Validation middleware
const validateContactForm = [
  check('name')
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  check('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address'),
  check('message')
    .notEmpty().withMessage('Message is required')
    .isLength({ min: 10, max: 1000 }).withMessage('Message must be between 10 and 1000 characters')
];

// POST endpoint for contact form
app.post('/api/contact', contactFormLimiter, validateContactForm, async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { name, email, message } = req.body;

  try {
    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: 'route66hemp@gmail.com', // Your store's email
      subject: `New Contact Form Submission from ${name}`,
      text: `
        Name: ${name}
        Email: ${email}
        
        Message:
        ${message}
      `,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);
    
    // Optional: Save to database
    // await saveToDatabase(req.body);
    
    // Send auto-reply to customer
    const autoReplyOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: email,
      subject: 'Thank you for contacting Route 66 Hemp!',
      text: `
        Hello ${name},
        
        Thank you for contacting Route 66 Hemp. We have received your message and will get back to you as soon as possible, usually within 24-48 business hours.
        
        Best regards,
        The Route 66 Hemp Team
      `,
      html: `
        <h2>Thank you for contacting Route 66 Hemp!</h2>
        <p>Hello ${name},</p>
        <p>Thank you for contacting us. We have received your message and will get back to you as soon as possible, usually within 24-48 business hours.</p>
        <p>Best regards,</p>
        <p><strong>The Route 66 Hemp Team</strong></p>
      `
    };
    
    await transporter.sendMail(autoReplyOptions);

    res.status(200).json({ success: true, message: 'Your message has been sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, message: 'Failed to send message. Please try again later.' });
  }
});

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Database integration (optional)
async function saveToDatabase(formData) {
  // Implement database storage logic here
  // Example using MongoDB:
  // const db = await MongoClient.connect(process.env.MONGO_URI);
  // await db.collection('contactSubmissions').insertOne({
  //   ...formData,
  //   timestamp: new Date()
  // });
}