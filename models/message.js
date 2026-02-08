const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    title: { type: String, required: true }, // Added title
    text: { type: String, required: true },
    imageURL: { type: String, default: '' }, // Added image support
    community: { type: String, default: 'general' }, // Category/Subreddit (default: general)
    author: { type: String },
    userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Upvoters list
    downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Downvoters list
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);
