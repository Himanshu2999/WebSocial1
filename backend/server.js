require('dotenv').config();
const cors = require('cors');
const mg = require('mongoose');
const exp = require('express');
const app = exp();
const routsapi = require('./routes');
const fileapi = require('./uploadapis');

// Middleware
app.use(exp.urlencoded({ extended: false }));
app.use(exp.json());
app.use(cors({origin:'http://localhost:3000'}));

// MongoDB Connection
mg.connect('mongodb+srv://Himan13:App123@cluster0.ovylhfy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("MongoDB connection failed:", err));

mg.set('strictQuery', false);

// API Routes
app.use("/api", routsapi);
app.use("/api", fileapi);

// Test Route
app.get('/', (req, res) => {
    res.send("Welcome to our Website");
});

// Server Listening
const port = process.env.PORT || 9000;  // Dynamic Port for Render
app.listen(port, () => {
    console.log(`Server is connected on port ${port}`);
});
