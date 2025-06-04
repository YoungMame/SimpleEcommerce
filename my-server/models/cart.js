const mongoose = require('mongoose');

const cartItemSchema = mongoose.Schema({
    productId: {
        type: String, 
        required: true
    },
    quantity: {
        type: Number,
        required: true
    }
})

module.exports.cartItemSchema = cartItemSchema;