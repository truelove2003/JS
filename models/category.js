const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Category schema
const CategorySchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  }
}, { timestamps: true });  // This will automatically add `createdAt` and `updatedAt` fields

// Create the Category model
const Category = mongoose.model('Category', CategorySchema);

module.exports = Category;
