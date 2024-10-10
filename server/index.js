// index.js
// Required modules
const express = require("express");
const path = require("path");
const fs = require("fs").promises;

// Initialize Express application
const app = express();

// Define paths
const clientPath = path.join(__dirname, "..", "client/src");
const dataPath = path.join(__dirname, "data", "users.json");
const serverPublic = path.join(__dirname, "public");
// Middleware setup
app.use(express.static(clientPath)); // Serve static files from client directory
app.use(express.static(serverPublic)); // Serve static files from client directory
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(express.json()); // Parse JSON bodies

// Routes

// Home Route

app.get("/users", async (req, res) => {
  try {
    const data = await fs.readFile(dataPath, "utf8");

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

app.get("/", (req, res) => {
  res.sendFile("index.html", { root: clientPath });
});

app.get("/profile", (req, res) => {
  res.sendFile("pages/profile.html", { root: serverPublic });
});

app.get("/diary", (req, res) => {
  res.sendFile("pages/diary.html", { root: serverPublic });
});

// indexgn up and Login Route
app.get("/signup", (req, res) => {
  res.sendFile("pages/signup.html", { root: serverPublic });
});
app.get("/login", (req, res) => {
  res.sendFile("pages/login.html", { root: serverPublic });
});
app.get("/exerciselog", (req, res) => {
  res.sendFile("pages/exerciselog.html", { root: serverPublic });
});

// About Route

app.get("/about", (req, res) => {
  res.sendFile("pages/about.html", { root: serverPublic });
});

// Retrieve Data from signup and store it

app.post("/sign-up", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    // read existing users from file
    const data = await fs.readFile(dataPath, "utf8");
    const users = JSON.parse(data);
    // if file doesn't exist or is empty, start with an empty array
    // find or create user
    let user = users.find((u) => u.email === email);
    console.log(user);
    if (user) {
      res.status(409).json({ error: "This user already exist" });
    } else {
      // let id = Math.floor(Math.random() * 999);

      user = { username, email, password, diary: [], runs: [], exercises: [] };
      users.push(user);
      await fs.writeFile(dataPath, JSON.stringify(users, null, 2));
      res.status(200).json(user);
    }
  } catch (error) {
    console.error("Error processing form:", error);
    res
      .status(500)
      .json({ error: "An error occurred while processing your submission." });
  }
});

app.post("/r-exercise-submit", async (req, res) => {
  try {
    let { rType, reps, currentUser } = req.body;
    // read existing users from file
    const data = await fs.readFile(dataPath, "utf8");
    if (data) {
      let users = JSON.parse(data);
      // currentUser = JSON.parse(currentUser);
      console.log(currentUser.username, currentUser.email);
      let userIndex = users.findIndex(
        (user) =>
          user.username === currentUser.username &&
          user.email === currentUser.email
      );
      console.log(userIndex);
      console.log(currentUser);

      if (userIndex === -1) {
        return res.status(404).json({ message: " User not found" });
      }
      console.log(" current user is " + currentUser.name);

      const date = new Date();
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      // const fullDate = month + "/" + day + "/" + year;
      const fullDate = `${month}/${day}/${year}`;

      let eLog = { type: rType, date: fullDate, reps: reps };
      users[userIndex].exercises.push(eLog);
      console.log(users);
      // let user = users.find(user => user.username === currentUser.username && user.email === currentUser.email);
      await fs.writeFile(dataPath, JSON.stringify(users, null, 2));
      res.status(200).json(users[userIndex]);
    }
  } catch (error) {
    console.error("Error processing form:", error);
    res
      .status(500)
      .json({ error: "An error occurred while processing your submission." });
  }
});

app.delete("/exercise-delete", async (req, res) => {
  try {
    let { entry, currentUser } = req.body;

    if (!currentUser || !entry) {
      return res.status(400).json({ error: "Invalid request data" });
    }

    // try to read the users.json file and cache as data
    const data = await fs.readFile(dataPath, "utf8");
    // parse the data
    let users = JSON.parse(data);

    // cache the userIndex based on a matching name and email
    let userIndex = users.findIndex(
      (user) =>
        user.username === currentUser.username &&
        user.email === currentUser.email &&
        user.password === currentUser.password
    );
    console.log(userIndex);
    if (userIndex === -1) {
      return res.status(404).json({ error: "User not found" });
    }
    let user = users[userIndex];
    console.log(user.exercises[0].type);
    console.log(entry);
    let exerciseIndex = user.exercises.findIndex(
      (exercise) =>
        exercise.type === entry.type &&
        exercise.date === entry.date &&
        exercise.reps === entry.reps
    );
    console.log(exerciseIndex);
    console.log(exerciseIndex);
    if (exerciseIndex === -1) {
      return res.status(404).json({ error: "Exercise not found" });
    }
    //   users[userIndex].diary.push(entry);
    users[userIndex].exercises.splice(exerciseIndex, 1);
    console.log(users[userIndex]);
    try {
      await fs.writeFile(dataPath, JSON.stringify(users, null, 2));
    } catch (error) {
      console.error("Failed to write to database");
    }
    res.status(200).json({ user, reload: true });
    // send a success deleted message
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/exercise-edit", async (req, res) => {
  try {
    let { entry, newEntry, currentUser } = req.body;

    if (!currentUser || !entry) {
      return res.status(400).json({ error: "Invalid request data" });
    }

    // try to read the users.json file and cache as data
    const data = await fs.readFile(dataPath, "utf8");
    // parse the data
    let users = JSON.parse(data);

    // cache the userIndex based on a matching name and email
    let userIndex = users.findIndex(
      (user) =>
        user.username === currentUser.username &&
        user.email === currentUser.email &&
        user.password === currentUser.password
    );
    console.log(userIndex);
    if (userIndex === -1) {
      return res.status(404).json({ error: "User not found" });
    }
    let user = users[userIndex];
    console.log(user.exercises[0].type);
    let exerciseIndex = user.exercises.findIndex(
      (exercise) =>
        exercise.type === entry.type &&
        exercise.date === entry.date &&
        exercise.reps === entry.reps
    );
    console.log(exerciseIndex);
    if (exerciseIndex === -1) {
      return res.status(404).json({ error: "Run not found" });
    }

    users[userIndex].exercises[exerciseIndex] = {
      ...users[userIndex].exercises[exerciseIndex],
      type: newEntry.type,
      date: entry.date,
      reps: newEntry.reps,
    };

    console.log(users[userIndex]);
    try {
      await fs.writeFile(dataPath, JSON.stringify(users, null, 2));
    } catch (error) {
      console.error("Failed to write to database");
    }
    res.status(200).json({ user, reload: true });
    // send a success deleted message
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/d-exercise-submit", async (req, res) => {
  try {
    let { dType, duration, currentUser } = req.body;
    // read existing users from file
    const data = await fs.readFile(dataPath, "utf8");
    if (data) {
      let users = JSON.parse(data);
      // currentUser = JSON.parse(currentUser);
      console.log(currentUser.username, currentUser.email);
      let userIndex = users.findIndex(
        (user) =>
          user.username === currentUser.username &&
          user.email === currentUser.email
      );
      console.log(userIndex);
      console.log(currentUser);

      if (userIndex === -1) {
        return res.status(404).json({ message: " User not found" });
      }
      console.log(" current user is " + currentUser.name);

      const date = new Date();
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      // const fullDate = month + "/" + day + "/" + year;
      const fullDate = `${month}/${day}/${year}`;

      let eLog = { type: dType, date: fullDate, duration: duration };
      users[userIndex].runs.push(eLog);
      console.log(users);
      // let user = users.find(user => user.username === currentUser.username && user.email === currentUser.email);
      await fs.writeFile(dataPath, JSON.stringify(users, null, 2));
      res.status(200).json(users[userIndex]);
    }
  } catch (error) {
    console.error("Error processing form:", error);
    res
      .status(500)
      .json({ error: "An error occurred while processing your submission." });
  }
});

app.delete("/run-delete", async (req, res) => {
  try {
    let { entry, currentUser } = req.body;

    if (!currentUser || !entry) {
      return res.status(400).json({ error: "Invalid request data" });
    }

    // try to read the users.json file and cache as data
    const data = await fs.readFile(dataPath, "utf8");
    // parse the data
    let users = JSON.parse(data);

    // cache the userIndex based on a matching name and email
    let userIndex = users.findIndex(
      (user) =>
        user.username === currentUser.username &&
        user.email === currentUser.email &&
        user.password === currentUser.password
    );
    console.log(userIndex);
    if (userIndex === -1) {
      return res.status(404).json({ error: "User not found" });
    }
    let user = users[userIndex];
    console.log(user.runs[0].type);
    let runIndex = user.runs.findIndex(
      (run) =>
        run.type === entry.type &&
        run.date === entry.date &&
        run.duration === entry.duration
    );
    console.log(runIndex);
    if (runIndex === -1) {
      return res.status(404).json({ error: "Run not found" });
    }
    //   users[userIndex].diary.push(entry);
    users[userIndex].runs.splice(runIndex, 1);
    console.log(users[userIndex]);
    try {
      await fs.writeFile(dataPath, JSON.stringify(users, null, 2));
    } catch (error) {
      console.error("Failed to write to database");
    }
    res.status(200).json({ user, reload: true });
    // send a success deleted message
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/run-edit", async (req, res) => {
  try {
    let { entry, newEntry, currentUser } = req.body;

    if (!currentUser || !entry) {
      return res.status(400).json({ error: "Invalid request data" });
    }

    // try to read the users.json file and cache as data
    const data = await fs.readFile(dataPath, "utf8");
    // parse the data
    let users = JSON.parse(data);

    console.log(users);
    // cache the userIndex based on a matching name and email
    let userIndex = users.findIndex(
      (user) =>
        user.username === currentUser.username &&
        user.email === currentUser.email &&
        user.password === currentUser.password
    );
    console.log(userIndex);
    if (userIndex === -1) {
      return res.status(404).json({ error: "User not found" });
    }
    // console.log(user.runs[0].type);
    let user = users[userIndex];
    let runIndex = user.runs.findIndex(
      (run) =>
        run.type === entry.type &&
        run.date === entry.date &&
        run.duration === entry.duration
    );
    console.log(runIndex);
    if (runIndex === -1) {
      return res.status(404).json({ error: "Run not found" });
    }

    users[userIndex].runs[runIndex] = {
      ...users[userIndex].runs[runIndex],
      type: newEntry.type,
      date: entry.date,
      duration: newEntry.duration,
    };

    //   users[userIndex].runs[runIndex]["Exercise Type"] = newEntry["Exercise Type"];
    //   users[userIndex].runs[runIndex].duration = newEntry.duration;
    //   users[userIndex].diary.push(entry);
    // users[userIndex].runs.splice(runIndex, 1);
    console.log(users[userIndex]);
    try {
      await fs.writeFile(dataPath, JSON.stringify(users, null, 2));
      // let user = users[userIndex];
      res.status(200).json({ user, reload: true });
    } catch (error) {
      console.error("Failed to write to database");
    }
    // send a success deleted message
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/diary-submit", async (req, res) => {
  try {
    let { title, diary, currentUser } = req.body;
    // read existing users from file
    const data = await fs.readFile(dataPath, "utf8");
    if (data) {
      let users = JSON.parse(data);
      currentUser = JSON.parse(currentUser);
      console.log(currentUser.username, currentUser.email);
      let userIndex = users.findIndex(
        (user) =>
          user.username === currentUser.username &&
          user.email === currentUser.email
      );
      console.log(userIndex);
      console.log(currentUser);

      if (userIndex === -1) {
        return res.status(404).json({ message: " User not found" });
      }
      // console.log(" current user is " + currentUser.name);

      const date = new Date();
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      // const fullDate = month + "/" + day + "/" + year;
      const fullDate = `${month}/${day}/${year}`;

      let entry = { title: title, date: fullDate, diary: diary };
      users[userIndex].diary.push(entry);
      console.log(users);
      let user = users[userIndex];
      console.log(user);
      res.status(200).json(user);
      await fs.writeFile(dataPath, JSON.stringify(users, null, 2));
    }
  } catch (error) {
    console.error("Error processing form:", error);
    res
      .status(500)
      .json({ error: "An error occurred while processing your submission." });
  }
});

app.post("/log-in/:email/:password", async (req, res) => {
  try {
    const { email, password } = req.body;
    // read existing users from file
    const data = await fs.readFile(dataPath, "utf8");
    const users = JSON.parse(data);

    const user = users.find(
      (u) => u.password === password && u.email === email
    );

    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Error during sign-in:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
