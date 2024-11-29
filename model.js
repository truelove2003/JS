const mongoose = require('mongoose');

// Định nghĩa Schema cho User
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

// Tạo Model từ Schema
const User = mongoose.model('User', userSchema);

module.exports = User;
