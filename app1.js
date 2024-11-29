const express = require('express');
const path = require('path');
const mongoose = require('mongoose'); // Import mongoose
const session = require('express-session'); // Import express-session
const Contact = require('./models/contact'); // Đảm bảo đường dẫn đúng tới file contact.js
const User = require('./models/user');
const Category = require('./models/category');
const Product = require('./models/product'); // Đảm bảo đường dẫn đúng tới file product.js
const CartItem = require('./models/CartItem');
const Order = require('./models/Order');
const bcrypt = require('bcrypt'); // Import bcrypt
const multer = require('multer');
const fs = require('fs');
const router = express.Router(); // Tạo một đối tượng routerconst router = express.Router(); // Tạo một đối tượng router

const app = express();
const port = 3000;

// Tạo thư mục uploads nếu chưa tồn tại
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

app.set('views', path.join(__dirname, 'views')); // Đảm bảo đường dẫn này đúng
// Kết nối đến MongoDB
mongoose.connect('mongodb://localhost:27017/mydatabase', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Kết nối MongoDB thành công'))
.catch(err => console.error('Lỗi kết nối MongoDB', err));

app.use('/uploads', express.static('uploads'));


app.use(express.urlencoded({ extended: true }));

//////////////////////////////////////////
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/'); // Đường dẫn thư mục lưu ảnh
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname)); // Tạo tên tệp duy nhất
    }
  });
  
  const upload = multer({ storage: storage });

////////////////////////////////////////
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_default_secret', // Khóa bí mật
    resave: false,
    saveUninitialized: true
}));


// Cấu hình thư mục chứa các tệp mẫu EJS
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Cấu hình thư mục public để phục vụ các tệp tĩnh
app.use(express.static(path.join(__dirname, 'public')));

// Middleware để phân tích dữ liệu JSON và URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
 

// User Route (Home Page)
app.get('/', async (req, res) => {
    const userId = req.session.userId;

    if (!userId) {
        // Nếu chưa đăng nhập, không lấy dữ liệu người dùng
        return res.render('index1', {
            title: 'Trang Chủ',
            user: null // Không truyền thông tin người dùng
        });
    }

    try {
        const user = await User.findById(userId);
        
        // Nếu là admin, không hiển thị dữ liệu
        if (user.role === 'admin') {
            return res.render('index1', {
                title: 'Trang Chủ',
                user: null // Không hiển thị thông tin admin
            });
        }

        // Nếu là user, truyền thông tin vào mẫu
        res.render('index1', {
            title: 'Trang Chủ',
            user: user // Truyền thông tin người dùng vào mẫu
        });
    } catch (err) {
        console.error('Lỗi:', err);
        res.status(500).send('Có lỗi xảy ra. Vui lòng thử lại.');
    }
});
app.get('/about', (req, res) => {
    res.render('about', { title: 'Giới Thiệu' }); // Truyền biến cho template
});
app.get('/shop-detail', (req, res) => {
    res.render('shop-detail', { title: 'Giới Thiệu' }); // Truyền biến cho template
});
app.get('/contact', (req, res) => {
    res.render('contact', { title: 'Liên Hệ' });
});


// Xử lý form liên hệ
app.post('/contact', async (req, res) => {
    const { name, email, subject, message } = req.body;
    console.log('Dữ liệu gửi:', { name, email, subject, message });

    try {
        const newContact = new Contact({ name, email, subject, message });
        await newContact.save();
        res.send('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ trả lời bạn sớm.');
    } catch (err) {
        console.error('Lỗi:', err);
        res.status(500).send('Có lỗi xảy ra. Vui lòng thử lại sau.');
    }
});
// Đường dẫn để hiển thị trang đăng ký
app.get('/register', (req, res) => {
    res.render('admin/register', { title: 'Đăng Ký' });
});
// Xử lý form đăng ký
app.post('/register', async (req, res) => {
    const { username, password, role } = req.body;

    try {
        // Kiểm tra xem tên người dùng đã tồn tại chưa
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).send('Tên người dùng đã tồn tại.');
        }

        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // Tạo người dùng mới
        const newUser = new User({
            username,
            password: hashedPassword,
            role // Lưu quyền
        });
        await newUser.save();

        res.send('Đăng ký thành công!');
    } catch (err) {
        console.error('Lỗi:', err);
        res.status(500).send('Có lỗi xảy ra. Vui lòng thử lại.');
    }
});
// Đường dẫn đến trang đăng nhập
// Đường dẫn đến trang đăng nhập
app.get('/login', (req, res) => {
    res.render('admin/login', { title: 'Đăng Nhập' });
});
// Form login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).send('Tên người dùng không tồn tại.');
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).send('Mật khẩu không đúng.');
        }

        // Lưu thông tin người dùng vào session
        req.session.userId = user._id;
        req.session.username = user.username; // Lưu tên người dùng vào session
        req.session.role = user.role; // Lưu vai trò vào session

        // Kiểm tra vai trò của người dùng
        if (user.role === 'admin') {
            res.redirect('/admin'); // Chuyển đến trang admin nếu là admin
        } else {
            res.redirect('/'); // Chuyển đến trang chủ nếu là user
        }
    } catch (err) {
        console.error('Lỗi:', err);
        res.status(500).send('Có lỗi xảy ra. Vui lòng thử lại.');
    }
});

function checkAdmin(req, res, next) {
    if (req.session.role === 'admin') {
        return next(); // Cho phép truy cập
    }
    return res.status(403).send('Bạn không có quyền truy cập.');
}

app.get('/user-dashboard', (req, res) => {
    if (req.session.role === 'user') {
        res.render('user-dashboard', { title: 'Bảng Điều Khiển Người Dùng' });
    } else {
        res.status(403).send('Bạn không có quyền truy cập vào bảng điều khiển này.');
    }
});
// Đăng xuất
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Lỗi đăng xuất:', err);
            return res.status(500).send('Có lỗi xảy ra. Vui lòng thử lại.');
        }
        res.redirect('/'); // Chuyển hướng về trang chủ sau khi đăng xuất
    });
});
//////////////////////////////////////////////////////////////////////////////////////////////////////////// 
/////////// ADMIN /////////
app.get('/admin', (req, res) => {
    if (req.session.role === 'admin') {
        res.render('admin/index', { user: req.session.username }); 
    } else {
        res.redirect('/');
    }
});


app.get('/admin/tables_contact', async (req, res) => {
    if (req.session.role === 'admin') {
        try {
            const contacts = await Contact.find({});
            res.render('admin/tables_contact', {
                contacts,
                user: req.session.username // Truyền tên admin vào view
            });
        } catch (error) {
            res.status(500).send('Server Error');
        }
    } else {
        res.redirect('/'); // Điều hướng người dùng không phải admin về trang chủ
    }
});
// Route API để lấy danh sách liên hệ
app.get('/api/contacts', async (req, res) => {
    try {
        const contacts = await Contact.find({});
        res.json(contacts);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }   
});
app.get('/admin/create-category', async (req, res) => {
    if (req.session.role === 'admin') {
        try {
            res.render('admin/create-category', {
                user: req.session.username // Truyền tên admin vào view
            });
        } catch (error) {
            res.status(500).send('Lỗi server');
        }
    } else {
        res.redirect('/'); // Điều hướng người dùng không phải admin về trang chủ
    }
});
app.post('/admin/create-category', async (req, res) => {
    console.log(req.body);
    if (req.session.role === 'admin') {
        try {
            const { name, description } = req.body; 
            
            // Kiểm tra xem tên category đã tồn tại chưa
            const existingCategory = await Category.findOne({ name });
            if (existingCategory) {
                return res.status(400).send('Category đã tồn tại.');
            }

            const newCategory = new Category({ name, description });
            await newCategory.save(); 
            res.redirect('/admin/categories'); 
        } catch (error) {
            console.error('Lỗi khi thêm category:', error); // In ra thông báo lỗi cụ thể
            res.status(500).send('Lỗi khi thêm category');
        }
    } else {
        res.redirect('/'); 
    }
});

app.get('/admin/categories', async (req, res) => {
    if (req.session.role === 'admin') {
        try {
            const categories = await Category.find({}); // Lấy danh sách Category từ database
            res.render('admin/categories', {
                categories, // Truyền dữ liệu Category vào view
                user: req.session.username // Truyền tên admin vào view
            });
        } catch (error) {
            console.error('Lỗi khi lấy danh sách categories:', error);
            res.status(500).send('Lỗi khi lấy danh sách categories');
        }
    } else {
        res.redirect('/'); // Điều hướng người dùng không phải admin về trang chủ
    }
});
// Route để lấy thông tin category cần chỉnh sửa
app.get('/admin/edit-category/:id', async (req, res) => {
    if (req.session.role === 'admin') {
        try {
            const category = await Category.findById(req.params.id); // Lấy category theo ID
            res.render('admin/edit-category', {
                category, // Truyền dữ liệu category vào view
                user: req.session.username // Truyền tên admin vào view
            });
        } catch (error) {
            console.error('Lỗi khi lấy category:', error);
            res.status(500).send('Lỗi khi lấy category');
        }
    } else {
        res.redirect('/'); // Điều hướng người dùng không phải admin về trang chủ
    }
});
// Route để cập nhật category
app.post('/admin/edit-category/:id', async (req, res) => {
    if (req.session.role === 'admin') {
        try {
            const { name, description } = req.body; // Lấy tên và mô tả từ form
            
            await Category.findByIdAndUpdate(req.params.id, {
                name,
                description
            });

            res.redirect('/admin/categories'); // Điều hướng về trang danh sách categories sau khi cập nhật thành công
        } catch (error) {
            console.error('Lỗi khi cập nhật category:', error);
            res.status(500).send('Lỗi khi cập nhật category');
        }
    } else {
        res.redirect('/'); // Điều hướng người dùng không phải admin về trang chủ
    }
});
// Route để xóa category
app.get('/admin/delete-category/:id', async (req, res) => {
    if (req.session.role === 'admin') {
        try {
            await Category.findByIdAndDelete(req.params.id); // Xóa category theo ID
            res.redirect('/admin/categories'); // Điều hướng về trang danh sách categories sau khi xóa thành công
        } catch (error) {
            console.error('Lỗi khi xóa category:', error);
            res.status(500).send('Lỗi khi xóa category');
        }
    } else {
        res.redirect('/'); // Điều hướng người dùng không phải admin về trang chủ
    }
});
// Route để hiển thị form thêm sản phẩm
app.get('/admin/create-product', async (req, res) => {
    if (req.session.role === 'admin') {
        try {
            const categories = await Category.find({}); // Lấy danh sách categories từ database
            res.render('admin/create-product', {
                categories, // Truyền danh sách categories vào view
                user: req.session.username // Truyền tên admin vào view
            });
        } catch (error) {
            console.error('Lỗi khi lấy categories:', error);
            res.status(500).send('Lỗi khi lấy categories');
        }
    } else {
        res.redirect('/'); // Điều hướng người dùng không phải admin về trang chủ
    }
});

// Route để xử lý thêm sản phẩm
app.post('/admin/create-product', upload.single('image'), async (req, res) => {
    if (req.session.role === 'admin') {
        try {
            const { name, description, price, stock, category } = req.body; // Lấy dữ liệu từ form
            
            const newProduct = new Product({
                name,
                description,
                price,
                stock,
                category,
                image: req.file.path // Lưu đường dẫn ảnh
            });

            await newProduct.save(); // Lưu sản phẩm mới vào database
            res.redirect('/admin/products'); // Điều hướng về trang danh sách sản phẩm sau khi thêm thành công
        } catch (error) {
            console.error('Lỗi khi thêm sản phẩm:', error);
            res.status(500).send('Lỗi khi thêm sản phẩm');
        }
    } else {
        res.redirect('/'); // Điều hướng người dùng không phải admin về trang chủ
    }
});
// Route để hiển thị danh sách sản phẩm
app.get('/admin/products', async (req, res) => {
    if (req.session.role === 'admin') {
        try {
            const products = await Product.find().populate('category'); // Lấy danh sách sản phẩm và điền thông tin danh mục
            res.render('admin/products', { products, user: req.session.username });
        } catch (error) {
            res.status(500).send('Lỗi server');
        }
    } else {
        res.redirect('/');
    }
});
// Route để xóa sản phẩm
app.post('/admin/delete-product/:id', async (req, res) => {
    if (req.session.role === 'admin') {
        try {
            const productId = req.params.id;
            await Product.findByIdAndDelete(productId); // Xóa sản phẩm theo ID
            res.redirect('/admin/products'); // Điều hướng về danh sách sản phẩm
        } catch (error) {
            console.error('Lỗi khi xóa sản phẩm:', error);
            res.status(500).send('Lỗi khi xóa sản phẩm');
        }
    } else {
        res.redirect('/'); // Điều hướng người dùng không phải admin về trang chủ
    }
});


// Route để lấy thông tin sản phẩm cần chỉnh sửa và danh sách danh mục
app.get('/admin/edit-product/:id', async (req, res) => {
    if (req.session.role === 'admin') {
        try {
            const product = await Product.findById(req.params.id); // Lấy sản phẩm theo ID
            const categories = await Category.find(); // Lấy tất cả các danh mục
            
            // Kiểm tra xem sản phẩm và danh mục có tồn tại không
            if (!product) {
                return res.status(404).send('Không tìm thấy sản phẩm');
            }

            res.render('admin/edit-product', {
                product, // Truyền dữ liệu sản phẩm vào view
                categories, // Truyền danh sách danh mục vào view
                user: req.session.username // Truyền tên admin vào view
            });
        } catch (error) {
            console.error('Lỗi khi lấy sản phẩm:', error);
            res.status(500).send('Lỗi khi lấy sản phẩm');
        }
    } else {
        res.redirect('/'); // Điều hướng người dùng không phải admin về trang chủ
    }
});


// Route để xử lý cập nhật thông tin sản phẩm
app.post('/admin/edit-product/:id', upload.single('image'), async (req, res) => {
    if (req.session.role === 'admin') {
        try {
            const { name, description, category, price, stock } = req.body; // Lấy thông tin từ form
            
            // Tạo đối tượng cập nhật
            const updateData = {
                name,
                description,
                category,
                price,
                stock
            };

            // Kiểm tra và xử lý upload hình ảnh nếu có
            if (req.file) {
                updateData.image = req.file.path; // Lưu đường dẫn hình ảnh vào updateData
            }

            // Cập nhật sản phẩm trong cơ sở dữ liệu
            const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true }); // new: true để trả về tài liệu đã cập nhật
            if (!updatedProduct) {
                return res.status(404).send('Không tìm thấy sản phẩm để cập nhật');
            }

            res.redirect('/admin/products'); // Điều hướng về trang danh sách sản phẩm sau khi cập nhật thành công
        } catch (error) {
            console.error('Lỗi khi cập nhật sản phẩm:', error);
            res.status(500).send('Lỗi khi cập nhật sản phẩm');
        }
    } else {
        res.redirect('/'); // Điều hướng người dùng không phải admin về trang chủ
    }
});

//////////////////////ORDER ADMIN///////////////////////////////
// Lấy danh sách đơn hàng
// Lấy danh sách đơn hàng
app.get('/admin/orders', async (req, res) => {
    const username = req.session.username; // Lấy tên tài khoản từ session

    try {
        const orders = await Order.find().populate('userId'); // Lấy tất cả đơn hàng và thông tin người dùng
        res.render('admin/orders', { orders, username }); // Render view với danh sách đơn hàng và username
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.redirect('/'); // Quay lại trang chủ nếu có lỗi
    }
});


// Hiển thị form sửa đơn hàng
// Route xử lý hiển thị trang chỉnh sửa đơn hàng
app.get('/admin/orders/:id/edit', async (req, res) => {
    const orderId = req.params.id;
    const user = req.session.username; // Lấy thông tin username từ session

    try {
        // Tìm đơn hàng theo ID
        const order = await Order.findById(orderId).populate('items.productId'); // Populate sản phẩm trong đơn hàng
        if (!order) {
            return res.status(404).send('Order not found');
        }

        // Render trang edit-order và truyền thông tin đơn hàng cùng với user
        res.render('admin/edit-order', { order, user }); // Truyền user vào đây
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).send('Internal Server Error');
    }
});


// Cập nhật đơn hàng
app.post('/admin/orders/update/:id', async (req, res) => {
    const orderId = req.params.id;
    const { status } = req.body; // Chỉ cập nhật trạng thái

    try {
        await Order.findByIdAndUpdate(orderId, { status });
        res.redirect('/admin/orders'); // Quay lại danh sách đơn hàng
    } catch (error) {
        console.error('Error updating order:', error);
        res.redirect('/admin/orders');
    }
});

// Xóa đơn hàng
app.post('/admin/orders/delete/:id', async (req, res) => {
    const orderId = req.params.id;

    try {
        await Order.findByIdAndDelete(orderId);
        res.redirect('/admin/orders'); // Quay lại danh sách đơn hàng
    } catch (error) {
        console.error('Error deleting order:', error);
        res.redirect('/admin/orders');
    }
});























/////////////////////////////////////////////////////////////////////////////////
// Route để hiển thị trang chính
app.get('/shop', async (req, res) => {
    try {
        const products = await Product.find(); // Lấy sản phẩm từ MongoDB
        const user = req.session.username || null; // Lấy tên người dùng từ session
        res.render('shop', { products, user }); // Truyền sản phẩm và người dùng vào view
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


// Hàm thêm vào giỏ hàng
async function addToCart(userId, productId, quantity) {
    try {
        // Tìm sản phẩm theo ID
        const product = await Product.findById(productId);
        if (!product) {
            throw new Error('Product not found');
        }

        // Kiểm tra xem sản phẩm đã có trong giỏ hàng của người dùng chưa
        let cartItem = await CartItem.findOne({ userId, productId });

        if (cartItem) {
            // Nếu sản phẩm đã có trong giỏ, cập nhật số lượng
            cartItem.quantity += quantity;
        } else {
            // Nếu sản phẩm chưa có, tạo mới một bản ghi giỏ hàng
            cartItem = new CartItem({
                userId,
                productId,
                quantity,
                price: product.price,
                image: product.image // Lấy trường image từ product
            });
        }

        // Lưu giỏ hàng
        await cartItem.save();
        return cartItem;
    } catch (error) {
        console.error('Error adding to cart:', error.message);
        throw error;
    }
}



// Route xử lý thêm sản phẩm vào giỏ hàng
app.post('/add-to-cart/:id', async (req, res) => {
    const userId = req.session.userId;  // Lấy userId từ session của người dùng đã đăng nhập
    const productId = req.params.id;
    const quantity = parseInt(req.body.quantity, 10); // Lấy số lượng từ form

    try {
        // Thêm sản phẩm vào giỏ hàng
        await addToCart(userId, productId, quantity);
        res.redirect('/cart');  // Chuyển hướng người dùng đến trang giỏ hàng sau khi thêm thành công
    } catch (error) {
        res.status(500).send('Lỗi khi thêm sản phẩm vào giỏ hàng');
    }
});


////// CART ///////////////////
// Route hiển thị trang giỏ hàng
app.get('/cart', async (req, res) => {
    try {
        // Lấy các sản phẩm trong giỏ hàng của người dùng đang đăng nhập
        const cartItems = await CartItem.find({ userId: req.session.userId }).populate('productId');
        
        // Tính tổng tiền giỏ hàng
        let cartTotal = cartItems.reduce((total, item) => {
            return total + (item.quantity * item.price);
        }, 0);

        // Lấy tên người dùng từ session (nếu người dùng đã đăng nhập)
        const user = req.session.username || null;

        // Truyền dữ liệu giỏ hàng, tổng tiền và người dùng vào view
        res.render('cart', { cartItems, cartTotal, user });
    } catch (error) {
        console.error(error);
        res.redirect('/');
    }
});


// Route để xóa sản phẩm khỏi giỏ hàng
app.post('/cart/remove/:id', async (req, res) => {
    try {
        // Lấy ID của sản phẩm cần xóa từ params
        const cartItemId = req.params.id;

        // Tìm và xóa sản phẩm khỏi giỏ hàng của người dùng hiện tại
        await CartItem.findOneAndDelete({ _id: cartItemId, userId: req.session.userId });

        // Chuyển hướng về trang giỏ hàng sau khi xóa thành công
        res.redirect('/cart');
    } catch (error) {
        console.error(error);
        res.redirect('/cart'); // Nếu có lỗi, quay về trang giỏ hàng
    }
});




/////////////////////// CHECK OUT ///////////////////////////////
app.get('/checkout', async (req, res) => {
    const userId = req.session.userId;
    const user = req.session.username; // Assuming username is stored in the session

    try {
        // Find cart items for the logged-in user
        const cartItems = await CartItem.find({ userId }).populate('productId');

        if (!cartItems.length) {
            return res.redirect('/cart'); // Redirect if cart is empty
        }

        // Calculate total cost
        const cartTotal = cartItems.reduce((total, item) => total + (item.quantity * item.productId.price), 0);

        // Create a new order (save to orders collection)
        const newOrder = new Order({
            userId,
            items: cartItems.map(item => ({
                productId: item.productId._id,
                quantity: item.quantity,
                price: item.productId.price
            })),
            total: cartTotal,
            status: 'Pending',  // Default order status
        });

        await newOrder.save();

        // Clear cart after checkout
        await CartItem.deleteMany({ userId });

        // Pass cartItems, order, cartTotal, and user to the view
        res.render('order', { order: newOrder, cartTotal, user, cartItems });

    } catch (error) {
        console.error('Error during checkout:', error);
        res.redirect('/cart');
    }
});

app.get('/my-orders', async (req, res) => {
    const userId = req.session.userId;

    try {
        // Lấy tất cả đơn hàng của người dùng đang đăng nhập
        const orders = await Order.find({ userId }).populate('items.productId');

        // Render view để hiển thị đơn hàng
        res.render('my-orders', { orders, user: req.session.username });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.redirect('/'); // Redirect nếu có lỗi
    }
});







// Khởi động máy chủ
app.listen(port, () => {
    console.log(`Ứng dụng đang chạy tại http://localhost:${port}`);
});
