const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register new user. Only use this directly to create your first admin, or build a secure page to do it.
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            res.status(400);
            throw new Error('Please add all fields');
        }

        // Check if user exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            res.status(400);
            throw new Error('User already exists');
        }

        // Create user
        const user = await User.create({
            username,
            email,
            password,
        });

        if (user) {
            res.status(201).json({
                _id: user.id,
                username: user.username,
                email: user.email,
                token: generateToken(user._id),
            });
        } else {
            res.status(400);
            throw new Error('Invalid user data');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
    try {
        const email = req.body.email ? req.body.email.trim() : '';
        const password = req.body.password ? req.body.password.trim() : '';

        // Check for user email
        const user = await User.findOne({ email });
        console.log(`Login attempt for email: ${email}, exists: ${!!user}`);
        console.log(`Password received: "${password}", length: ${password ? password.length : 0}`);

        if (user) {
            const isMatch = await user.matchPassword(password);
            console.log(`Password match result: ${isMatch}`);
            
            if (isMatch) {
                res.json({
                    _id: user.id,
                    username: user.username,
                    email: user.email,
                    token: generateToken(user._id),
                });
                return;
            }
        }
        
        res.status(401);
        throw new Error('Invalid credentials');
    } catch (error) {
        next(error);
    }
};

module.exports = {
    registerUser,
    loginUser,
};
