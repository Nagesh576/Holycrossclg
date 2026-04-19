const Admission = require('../models/Admission');

// @desc    GET all admission submissions
// @route   GET /api/admission
// @access  Private
const getAdmissions = async (req, res, next) => {
    try {
        const admissions = await Admission.find().sort({ createdAt: -1 });
        res.status(200).json(admissions);
    } catch (error) {
        next(error);
    }
};

// @desc    Create an admission submission
// @route   POST /api/admission
// @access  Public
const createAdmission = async (req, res, next) => {
    try {
        const { name, email, phone, gender, dob, course } = req.body;
        
        // Ensure file is uploaded
        if (!req.file) {
            res.status(400);
            throw new Error('Please upload your 10th marksheet');
        }

        // Save just the relative 'uploads' path to the database
        const marksheetPath = 'uploads/' + req.file.filename;

        if (!name || !email || !phone || !gender || !dob || !course) {
            res.status(400);
            throw new Error('Please add all fields');
        }

        const admission = await Admission.create({
            name,
            email,
            phone,
            gender,
            dob,
            course,
            marksheetPath
        });

        res.status(201).json(admission);
    } catch (error) {
        next(error);
    }
};

// @desc    Update an admission
// @route   PUT /api/admission/:id
// @access  Private
const updateAdmission = async (req, res, next) => {
    try {
        const admissionId = req.params.id;
        const updatedAdmission = await Admission.findByIdAndUpdate(admissionId, req.body, { new: true });
        
        if (!updatedAdmission) {
            res.status(404);
            throw new Error('Admission record not found');
        }
        res.status(200).json(updatedAdmission);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete an admission
// @route   DELETE /api/admission/:id
// @access  Private
const deleteAdmission = async (req, res, next) => {
    try {
        const admissionId = req.params.id;
        const deletedAdmission = await Admission.findByIdAndDelete(admissionId);

        if (!deletedAdmission) {
            res.status(404);
            throw new Error('Admission record not found');
        }
        res.status(200).json({ id: req.params.id });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAdmissions,
    createAdmission,
    updateAdmission,
    deleteAdmission
};
