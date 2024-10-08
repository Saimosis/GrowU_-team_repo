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

app.get('/users', async (req, res) => {
    try {
        const data = await fs.readFile(dataPath, 'utf8');

        const users = JSON.parse(data);
        if (!users) {
            throw new Error("Error no users available");
        }
        res.status(200).json(users);
    } catch (error) {
        console.error("Problem getting users" + error.message);
        res.status(500).json({ error: "Problem reading users" });
    }
<<<<<<< HEAD
})
=======
});
>>>>>>> 5de6733b1ba3c54ff5e3738de542c0e25df8b2d6

app.get('/', (req, res) => {
    res.sendFile('index.html', { root: clientPath });
})

// Sign up and Login Route
app.get('/signup', (req, res) => {
    res.sendFile('pages/signup.html', { root: serverPublic })
})
app.get('/login', (req, res) => {
    res.sendFile('pages/login.html', { root: serverPublic })
})

// About Route

app.get('/about', (req, res) => {
    res.sendFile('pages/about.html', { root: serverPublic });
})

// Retrieve Data from signup and store it

app.post('/sign-up', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        // read existing users from file
            const data = await fs.readFile(dataPath, 'utf8');
            const users = JSON.parse(data)
            // if file doesn't exist or is empty, start with an empty array
        // find or create user
        let user = users.find(u => u.email === email && u.username === username && u.password === password)
        if (user) {
            res.status(409).json({ error: 'This user already exist' })
        } else {
            // let id = Math.floor(Math.random() * 999);
            user = { username, email, password };
            users.push(user);
            res.status(200).json(user);
        }

        // save updated users
        await fs.writeFile(dataPath, JSON.stringify(users, null, 2));
        // res.redirect('/login');
    } catch (error) {
        console.error('Error processing form:', error);
        res.status(500).json({ error: 'An error occurred while processing your submission.' });
    }


    // try {
    //     const { email, password } = req.body;
    //     // read existing users from file
    //     const data = await fs.readFile(dataPath, 'utf8');
    //     const users = JSON.parse(data)

    //     const user = users.find(u => u.password === password && u.email === email);

    //     if (user) {
    //         res.status(200).json(user)
    //     } else {
    //         res.status(404).json({ error: 'User not found' });
    //     }
    // } catch (error) {
    //     console.error('Error during sign-in:', error);
    //     res.status(500).json({ error: 'Internal server error' });
    // }

})

app.post('/log-in/:email/:password', async (req, res) => {
    try {
        const { email, password } = req.body;
        // read existing users from file
        const data = await fs.readFile(dataPath, 'utf8');
        const users = JSON.parse(data)

        const user = users.find(u => u.password === password && u.email === email);

        if (user) {
            res.status(200).json(user)
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Error during sign-in:', error);
        res.status(500).json({ error: 'Internal server error' });
    }

})

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});