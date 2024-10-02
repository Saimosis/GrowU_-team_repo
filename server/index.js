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
app.use(express.static(serverPublic)); // Serve static files from client directory
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

// About Route

app.get('/about', (req, res) => {
    res.sendFile('pages/about.html', { root: serverPublic });
})

// Retrieve Data from signup and store it

app.post('/submit-form', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        // read existing users from file
        let users = []
        try {
            const data = await fs.readFile(dataPath, 'utf8');
            users = JSON.parse(data)
        } catch (error) {
            // if file doesn't exist or is empty, start with an empty array
            console.error('Error reading user data', error);
            users = []
        }
        // find or create user
        let user = users.find(u => u.email === email && u.username === username && u.password === password)
        if (user) {
            alert('User already exist')
        } else {
            user = { username, email, password };
            users.push(user);
        }

        // save updated users
        await fs.writeFile(dataPath, JSON.stringify(users, null, 2));
        res.redirect('/signup');
    } catch (error) {
        console.error('Error processing form:', error);
        res.status(500).send('An error occurred while processing your submission.');
    }

})


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});