const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/user');
const path = require('path');

// Khởi tạo ứng dụng Express
const app = express();
const port = 3000;

// Kết nối đến cơ sở dữ liệu MongoDB
const mongoURI = 'mongodb://localhost:27017/mydatabase';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

// Lắng nghe sự kiện kết nối thành công
mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB successfully!');
}).on('error', (error) => {
    console.error('Connection error:', error);
});

// Cấu hình EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware để parse dữ liệu từ form
app.use(express.urlencoded({ extended: true }));

// Middleware để phục vụ các tệp tĩnh như CSS, JavaScript
app.use(express.static(path.join(__dirname, 'public')));

// Trang chủ - hiển thị tất cả người dùng
app.get('/', async (req, res) => {
    try {
        const users = await User.find({});
        res.render('index', { users: users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).send('Server error');
    }
});

// Trang thêm người dùng
app.get('/add-user', (req, res) => {
    res.render('add-user');
});

// Xử lý việc thêm người dùng
app.post('/add-user', async (req, res) => {
    const { name, email, password } = req.body;
    const user = new User({ name, email, password });
    
    try {
        await user.save();
        res.redirect('/');
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).send('Server error');
    }
});

// Trang chỉnh sửa người dùng
app.get('/edit-user/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).send('User not found');
        res.render('edit-user', { user: user });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).send('Server error');
    }
});

// Xử lý việc cập nhật người dùng
app.get('/edit-user/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).send('User not found');
        res.render('edit-user', { user: user });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).send('Server error');
    }
});

// Xóa người dùng
app.post('/delete-user/:id', async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) return res.status(404).send('User not found');
        res.redirect('/');
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).send('Server error');
    }
});

// Bắt lỗi 404
app.use((req, res) => {
    res.status(404).send('Page not found');
});

// Khởi động máy chủ
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
