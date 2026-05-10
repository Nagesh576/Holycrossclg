const mongoose = require('mongoose');

const contactSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email']
    },
    phone: {
        type: String,
        required: [true, 'Please add a phone number']
    },
    message: {
        type: String,
        required: [true, 'Please add a message']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Contact', contactSchema);
