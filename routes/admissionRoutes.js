const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { getAdmissions, createAdmission, updateAdmission, deleteAdmission } = require('../controllers/admissionController');
const { protect } = require('../middleware/authMiddleware');

const os = require('os');

// Setup multer storage
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, os.tmpdir());
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Routes
router.route('/')
    .get(protect, getAdmissions)
    .post(upload.single('file'), createAdmission);

router.route('/:id')
    .put(protect, updateAdmission)
    .delete(protect, deleteAdmission);

module.exports = router;
