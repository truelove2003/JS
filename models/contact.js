const mongoose = require('mongoose');

// Định nghĩa schema cho mô hình Contact
const contactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
});


// Tạo model từ schema
const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;
