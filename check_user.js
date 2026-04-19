const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

mongoose.connect('mongodb://127.0.0.1:27017/holycross')
.then(async () => {
    const user = await User.findOne({email: 'admin@example.com'});
    console.log("Found User:", user);
    if(user) {
        const isMatch = await bcrypt.compare('password123', user.password);
        console.log("Does 'password123' match?", isMatch);
        const match2 = await user.matchPassword('password123');
        console.log("Does user.matchPassword match?", match2);
    }
    process.exit();
}).catch(console.error);
