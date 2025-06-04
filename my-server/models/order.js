const mongoose = require('mongoose');
const { cartItemSchema } = require("./cart.js");

const orderSchema = mongoose.Schema({
        userId: {
            type: String, 
            required: true
        },
        items: [cartItemSchema],
        adress: {
            type: Object,
            required: true
        },
        suiviIds: {
            type: [String],
            required: false
        },
        paymentIntentId: {
            type: String,
            required: true
        },
        paymentIntentCaptured: {
            type: Boolean,
            required: true,
            default: false
        },
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('order', orderSchema);