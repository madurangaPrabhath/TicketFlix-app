import mongoose from "mongoose";

const showSchema = new mongoose.Schema({
    movieId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
        required: true
    },
    theater: {
        name: {
            type: String,
            required: true
        },
        location: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        }
    },
    showDate: {
        type: Date,
        required: true
    },
    showTime: {
        type: String,
        required: true
    },
    language: {
        type: String,
        required: true,
        default: "English"
    },
    format: {
        type: String,
        enum: ['2D', '3D', 'IMAX'],
        default: '2D'
    },
    seats: {
        total: {
            type: Number,
            required: true,
            default: 150
        },
        available: {
            type: Number,
            required: true,
            default: 150
        },
        booked: {
            type: [String],
            default: []
        },
        layout: {
            rows: {
                type: [String],
                default: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
            },
            seatsPerRow: {
                type: Number,
                default: 15
            }
        }
    },
    pricing: {
        standard: {
            type: Number,
            required: true,
            default: 250
        },
        premium: {
            type: Number,
            required: true,
            default: 350
        },
        vip: {
            type: Number,
            required: true,
            default: 500
        }
    },
    status: {
        type: String,
        enum: ['active', 'cancelled', 'completed'],
        default: 'active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const Show = mongoose.model('Show', showSchema);

export default Show;
