const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Product'
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true,
    },
    image: { // Thêm trường hình ảnh
        type: String,
        required: true,
    },
}, {
    timestamps: true
});

const CartItem = mongoose.model('CartItem', CartItemSchema);
module.exports = CartItem;
