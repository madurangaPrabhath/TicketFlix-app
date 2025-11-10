import mongoose from "mongoose";

const movieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    overview: {
        type: String,
        required: true
    },
    genres: {
        type: [String],
        required: true
    },
    vote_average: {
        type: Number,
        required: true,
        default: 0
    },
    release_date: {
        type: String,
        required: true
    },
    poster_path: {
        type: String,
        required: true
    },
    backdrop_path: {
        type: String
    },
    trailer_url: {
        type: String
    },
    director: {
        type: String
    },
    cast: {
        type: [String]
    },
    runtime: {
        type: Number
    },
    language: {
        type: String,
        default: "English"
    },
    budget: {
        type: Number
    },
    revenue: {
        type: Number
    },
    status: {
        type: String,
        enum: ['released', 'upcoming'],
        default: 'released'
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

const Movie = mongoose.model('Movie', movieSchema);

export default Movie;
