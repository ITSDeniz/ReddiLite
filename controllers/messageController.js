const Message = require('../models/message');
const Comment = require('../models/comment'); // Yorum modelini ekledik

exports.getMessages = async (req, res) => {
    try {
        // Mesajları getirirken oylama sayılarını da hesaplayarak döndürebiliriz ama şimdilik ham veriyi dönelim
        const messages = await Message.find().sort({ createdAt: -1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch messages" });
    }
};

exports.createMessage = async (req, res) => {
    try {
        const newMessage = new Message({
            title: req.body.title, // Başlık eklendi
            text: req.body.text,
            community: req.body.community || 'general', // Kategori eklendi
            author: req.user.username,
            userID: req.user.userID
        });
        await newMessage.save();
        res.status(201).json(newMessage);
    } catch (err) {
        res.status(400).json({ error: "Failed to save message", details: err.message });
    }
};

exports.deleteMessage = async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);
        if (!message) return res.status(404).json({ error: "Not found" });
        if (message.author !== req.user.username) return res.status(403).json({ error: "Unauthorized" });

        await Message.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted!" });
    } catch (err) {
        res.status(500).json({ error: "Delete failed" });
    }
};

exports.updateMessage = async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);
        if (!message) return res.status(404).json({ error: "Not found" });
        if (message.author !== req.user.username) return res.status(403).json({ error: "Unauthorized" });

        message.title = req.body.title || message.title; // Başlık güncelleme
        message.text = req.body.text || message.text;
        await message.save();
        res.json(message);
    } catch (err) {
        res.status(500).json({ error: "Update failed" });
    }
};

// YENİ: Posta oy verme (Upvote/Downvote)
exports.voteMessage = async (req, res) => {
    const { type } = req.body; // type: 'up' veya 'down'
    const userID = req.user.userID;

    try {
        const message = await Message.findById(req.params.id);
        if (!message) return res.status(404).json({ error: "Message not found" });

        // Önce kullanıcının eski oylarını temizle
        message.upvotes = message.upvotes.filter(id => id.toString() !== userID);
        message.downvotes = message.downvotes.filter(id => id.toString() !== userID);

        if (type === 'up') {
            message.upvotes.push(userID);
        } else if (type === 'down') {
            message.downvotes.push(userID);
        }
        // Eğer type 'none' ise (oyu geri alma), yukarıdaki temizleme yeterli.

        await message.save();
        res.json(message);
    } catch (err) {
        res.status(500).json({ error: "Voting failed" });
    }
};

// YENİ: Yorum yapma
exports.addComment = async (req, res) => {
    try {
        const newComment = new Comment({
            text: req.body.text,
            author: req.user.username,
            userID: req.user.userID,
            postID: req.params.id
        });
        await newComment.save();
        res.status(201).json(newComment);
    } catch (err) {
        res.status(400).json({ error: "Failed to add comment" });
    }
};

// YENİ: Bir postun yorumlarını getirme
exports.getComments = async (req, res) => {
    try {
        const comments = await Comment.find({ postID: req.params.id }).sort({ createdAt: 1 });
        res.json(comments);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch comments" });
    }
};