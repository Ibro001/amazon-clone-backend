const mongoose = require ('mongoose');

const productSchema = mongoose.Schema({
    title: String,
    imageURL: String,
    price: Number,
    rating: Number,
});

module.exports = mongoose.model('products', productSchema);