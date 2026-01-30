const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    title: { type: String, required: true }, // Başlık eklendi
    text: { type: String, required: true },
    community: { type: String, default: 'general' }, // Kategori/Subreddit (varsayılan: general)
    author: { type: String },
    userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Beğenenler listesi
    downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Beğenmeyenler listesi
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);
