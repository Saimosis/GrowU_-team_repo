// index.js
// Required modules
const express = require('express');
const path = require('path');
const fs = require('fs').promises;

// Initialize Express application
const app = express();

// Define paths
const clientPath = path.join(__dirname, '..', 'client/src');
const dataPath = path.join(__dirname, 'data', 'users.json');
const serverPublic = path.join(__dirname, 'public');
// Middleware setup
app.use(express.static(clientPath)); // Serve static files from client directory
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(express.json()); // Parse JSON bodies

// Routes

// Home Route

app.get('/', (req, res) => {
    res.sendFile('index.html', { root: clientPath });
})

// Sign up and Login Route
app.get('/signup', (req, res) => {
    res.sendFile('pages/signup.html', { root: serverPublic})
})
app.get('/login', (req, res) => {
    res.sendFile('pages/login.html', { root: serverPublic })
})

// Form Route

app.get('/form', (req, res) => {
    res.sendFile('pages/form.html', { root: serverPublic });
})