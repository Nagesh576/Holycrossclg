const Contact = require('../models/Contact');

// @desc    GET all contact submissions
// @route   GET /api/contact
// @access  Private
const getContacts = async (req, res, next) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.status(200).json(contacts);
    } catch (error) {
        next(error);
    }
};

// @desc    Create a contact submission
// @route   POST /api/contact
// @access  Public
const createContact = async (req, res, next) => {
    try {
        const { name, email, phone } = req.body;

        if (!name || !email || !phone) {
            res.status(400);
            throw new Error('Please add all fields');
        }

        const contact = await Contact.create({
            name,
            email,
            phone
        });

        res.status(201).json(contact);
    } catch (error) {
        next(error);
    }
};

// @desc    Update a contact
// @route   PUT /api/contact/:id
// @access  Private
const updateContact = async (req, res, next) => {
    try {
        const contactId = req.params.id;
        const updatedContact = await Contact.findByIdAndUpdate(contactId, req.body, { new: true });
        
        if (!updatedContact) {
            res.status(404);
            throw new Error('Contact not found');
        }
        res.status(200).json(updatedContact);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a contact
// @route   DELETE /api/contact/:id
// @access  Private
const deleteContact = async (req, res, next) => {
    try {
        const contactId = req.params.id;
        const deletedContact = await Contact.findByIdAndDelete(contactId);

        if (!deletedContact) {
            res.status(404);
            throw new Error('Contact not found');
        }
        res.status(200).json({ id: req.params.id });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getContacts,
    createContact,
    updateContact,
    deleteContact
};
