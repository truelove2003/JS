const mongoose = require('mongoose');
const User = require('./model');
require('./connect'); // Kết nối đến MongoDB

// Thêm một người dùng mới
const createUser = async () => {
    const user = new User({
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'password123'
    });
    
    await user.save();
    console.log('User created:', user);
};

// Tìm người dùng theo email
const findUserByEmail = async (email) => {
    const user = await User.findOne({ email: email });
    console.log('User found:', user);
};

// Gọi các hàm để thực hiện các thao tác
const run = async () => {
    await createUser();
    await findUserByEmail('john.doe@example.com');
};

run().catch(err => console.error(err));

