const mongoose = require('mongoose');

// URL kết nối đến MongoDB với cơ sở dữ liệu cụ thể
const mongoURI = 'mongodb://localhost:27017/mydatabase';

// Kết nối đến cơ sở dữ liệu MongoDB
mongoose.connect(mongoURI, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
});

// Lắng nghe sự kiện kết nối thành công
mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB successfully!');
}).on('error', (error) => {
    console.error('Connection error:', error);
});
