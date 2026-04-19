const mongoose = require('mongoose');
const Admission = require('./models/Admission');

mongoose.connect('mongodb+srv://rudraramnagesh29_db_user:nagesh8790@nagesh.antotsp.mongodb.net/holycross?appName=Nagesh')
.then(async () => {
    const admissions = await Admission.find();
    console.log("Admissions stored in DB:");
    admissions.forEach(a => console.log(a.marksheetPath));
    process.exit();
}).catch(console.error);
