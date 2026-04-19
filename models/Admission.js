const mongoose = require('mongoose');

const admissionSchema = mongoose.Schema({
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
    gender: {
        type: String,
        required: [true, 'Please specify gender']
    },
    dob: {
        type: Date,
        required: [true, 'Please add date of birth']
    },
    course: {
        type: String,
        required: [true, 'Please select a course']
    },
    marksheetPath: {
        type: String,
        required: [true, 'Please upload the 10th marksheet']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Admission', admissionSchema);
