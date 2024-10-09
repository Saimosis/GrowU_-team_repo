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
});

app.get('/', (req, res) => {
    res.sendFile('index.html', { root: clientPath });
})


app.get('/profile', (req, res) => {
    res.sendFile('pages/profile.html', { root: serverPublic });
})


app.get('/diary', (req, res) => {
    res.sendFile('pages/diary.html', { root: serverPublic });
})

// indexgn up and Login Route
app.get('/signup', (req, res) => {
    res.sendFile('pages/signup.html', { root: serverPublic })
})
app.get('/login', (req, res) => {
    res.sendFile('pages/login.html', { root: serverPublic })
})
app.get('/exerciselog', (req, res) => {
    res.sendFile('pages/exerciselog.html', { root: serverPublic })
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

            user = { username, email, password, diary: [], log: [] };
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
})




app.post('/d-exercise-submit/:dType/:duration/:currentUser/', async (req, res) => {
    try {
        let { dType, duration, currentUser } = req.body;
        // read existing users from file
        const data = await fs.readFile(dataPath, 'utf8');
        if (data) {
            let users = JSON.parse(data);
            currentUser = JSON.parse(currentUser);
            console.log(currentUser.username, currentUser.email);
            let userIndex = users.findIndex(user => user.username === currentUser.username && user.email === currentUser.email);
            console.log(userIndex);
            console.log(currentUser);

            if (userIndex === -1) {
                return res.status(404).json({ message: " User not found" });
            }
            console.log(' current user is ' + currentUser.name);

            const date = new Date();
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            // const fullDate = month + "/" + day + "/" + year;
            const fullDate = `${month}/${day}/${year}`;

            let eLog = { "Exercise Type": dType, "date":fullDate, "duration": duration };
            users[userIndex].log.push(eLog);
            console.log(users);
            let user = users.find(user => user.username === currentUser.username && user.email === currentUser.email);
            res.status(200).json(user);
            await fs.writeFile(dataPath, JSON.stringify(users, null, 2));
        }
    } catch (error) {
        console.error('Error processing form:', error);
        res.status(500).json({ error: 'An error occurred while processing your submission.' });
    }
})



app.post('/diary-submit/:title/:diary/:currentUser', async (req, res) => {
    try {
        let { title, diary, currentUser } = req.body;
        // read existing users from file
        const data = await fs.readFile(dataPath, 'utf8');
        if (data) {
            let users = JSON.parse(data);
            currentUser = JSON.parse(currentUser);
            console.log(currentUser.username, currentUser.email);
            let userIndex = users.findIndex(user => user.username === currentUser.username && user.email === currentUser.email);
            console.log(userIndex);
            console.log(currentUser);

            if (userIndex === -1) {
                return res.status(404).json({ message: " User not found" });
            }
            console.log(' current user is ' + currentUser.name);

            const date = new Date();
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            // const fullDate = month + "/" + day + "/" + year;
            const fullDate = `${month}/${day}/${year}`;

            let entry = { "title": title, "date":fullDate, "diary": diary };
            users[userIndex].diary.push(entry);
            console.log(users);
            let user = users.find(user => user.username === currentUser.username && user.email === currentUser.email);
            res.status(200).json(user);
            await fs.writeFile(dataPath, JSON.stringify(users, null, 2));
        }
    } catch (error) {
        console.error('Error processing form:', error);
        res.status(500).json({ error: 'An error occurred while processing your submission.' });
    }
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