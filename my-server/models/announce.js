const mongoose = require('mongoose');

const announceSchema = mongoose.Schema(
    {
        title : {
            type: String,
            required: true
        },
		text : {
            type: String,
            required: true
        },
		author : {
            type: String,
            required: true,
			default: "M'LaBrocante"
        },
		place : {
            type: String,
            required: false
        },
		date : {
			type: Date,
			required: false
		},
		duration : {
            type: String,
            required: false
        },
		image : {
			type: String,
			required: false
		}
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model('announce', announceSchema)