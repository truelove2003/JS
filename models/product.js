const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Định nghĩa schema cho sản phẩm
const ProductSchema = new Schema({
  name: {
    type: String,
    required: true, // Tên sản phẩm là bắt buộc
    trim: true // Xóa khoảng trắng ở đầu và cuối
  },
  description: {
    type: String,
    required: true, // Mô tả sản phẩm là bắt buộc
    trim: true // Xóa khoảng trắng ở đầu và cuối
  },
  price: {
    type: Number,
    required: true, // Giá sản phẩm là bắt buộc
    min: 0 // Giá không được nhỏ hơn 0
  },
  stock: {
    type: Number,
    required: true, // Số lượng sản phẩm là bắt buộc
    min: 0 // Số lượng không được nhỏ hơn 0
  },
  category: {
    type: Schema.Types.ObjectId, // Đối tượng liên kết tới mô hình Category
    ref: 'Category', // Tham chiếu tới mô hình Category
    required: true // Danh mục sản phẩm là bắt buộc
  },
  image: { // Thêm trường cho ảnh
    type: String,
    required: true // Trường này là bắt buộc
  }
}, { timestamps: true }); // Tự động thêm createdAt và updatedAt

// Tạo model cho sản phẩm
const Product = mongoose.model('Product', ProductSchema);

// Xuất mô hình Product
module.exports = Product;
