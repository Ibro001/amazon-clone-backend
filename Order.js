const mongoose = require('mongoose');


const orderSchema = mongoose.Schema({
    price: Number,
    products: Array,
    email: String,
    address: Object
});

module.exports = mongoose.model('orders', orderSchema)