const mongoose = require('mongoose')

const reserving = new mongoose.Schema({
	requestedBy:{
		type: mongoose.Schema.Types.ObjectId,
		default: undefined,
		required: false
	},
}, {timestamps: true});

const bookSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        required: true,
	},
	author:{
		type: String,
        required: false,
        default: "Unknown",
	},
    genre: {
        type: String,
        required: false,
        default: "General",
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'User'
	},
	releaseDate:{
		type: Date,
        required: false,
	},
	status:{
		type: String,
		enum: ["activated", "deactivated"],
		required: false,
		default: "deactivated"
	},
	bookings:{
		type: [reserving],
		default: []
	},
	bookImage:{
		type:Buffer
	}
}, {timestamps: true})




const Book = mongoose.model('Book', bookSchema)

module.exports= Book