const mongoose = require('mongoose');

const productSchema = mongoose.Schema(
    {
        title : {
            type: String,
            required: true,
        },
        productCode : {
            type: String,
            required: true,
        },
        price : {
            type: Number,
            required: true,
        },
        description : {
            type: String,
            required: true,
        },
        tags : {
            type: [String],
            required: true,
        },
        featured : {
            type: Boolean,
            required: true,
        },
        quantity : {
            type: Number,
            required: true,
        },
        pictures : {
            type: [String],
            required: true,
        },
        deliveryWeight : {
            type: Number
        },
        specialDelivery : {
            type: Boolean,
            required: true,
        },
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model('product', productSchema)