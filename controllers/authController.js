const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const JWT_SECRET = process.env.JWT_SECRET;

exports.register = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: "Please enter both username and password!" });
        }

        const newUser = new User({ username, password });
        await newUser.save();
        res.status(201).json({ message: "User created successfully!" });
        
    } catch (err) {
        console.error("DEBUG - Register Error:", err); 
        
        if (err.code === 11000) {
            return res.status(400).json({ error: "This username is already taken." });
        }
        
        res.status(400).json({ error: err.message }); 
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const token = jwt.sign({ userID: user._id, username: user.username }, JWT_SECRET);
        res.json({ token, username: user.username, userID: user._id });
    } catch (err) {
        res.status(500).json({ error: "Login failed" });
    }
};
