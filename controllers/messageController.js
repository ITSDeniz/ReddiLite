const Message = require('../models/message');
const Comment = require('../models/comment'); 
const aiService = require('../services/aiService');

exports.getMessages = async (req, res) => {
    try {
        
        const messages = await Message.find().sort({ createdAt: -1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch messages" });
    }
};

exports.createMessage = async (req, res) => {
    try {
        const { title, text } = req.body;
        let { community } = req.body;

        // AI Community suggestion (optional, continues even if it fails)
        if (!community || community === 'general') {
            try {
                const suggested = await aiService.suggestCommunity(title, text);
                community = suggested || 'general';
            } catch (e) {
                community = 'general';
            }
        }

        const newMessage = new Message({
            title: title, 
            text: text,
            imageURL: req.body.imageURL || '', 
            community: community, 
            author: req.user.username,
            userID: req.user.userID
        });
        await newMessage.save();
        res.status(201).json(newMessage);
    } catch (err) {
        res.status(400).json({ error: "Failed to save message", details: err.message });
    }
};

exports.summarizeMessage = async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);
        if (!message) return res.status(404).json({ error: "Post not found" });

        const summary = await aiService.summarizeText(message.text);
        res.json({ summary });
    } catch (err) {
        res.status(500).json({ error: "Summarization failed" });
    }
};

exports.deleteMessage = async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);
        if (!message) return res.status(404).json({ error: "Post not found" });

        console.log("DEBUG - Post Delete Attempt:", {
            postUserID: message.userID ? message.userID.toString() : 'null',
            requestUserID: req.user.userID
        });

        // Check if the user is the author of the post
        // Using userID for more reliable check than username
        if (message.userID && message.userID.toString() !== req.user.userID) {
            return res.status(403).json({ error: "Unauthorized: You can only delete your own posts" });
        }

        await Message.findByIdAndDelete(req.params.id);
        res.json({ message: "Post deleted successfully!" });
    } catch (err) {
        console.error("DEBUG - Post Delete Error:", err);
        res.status(500).json({ error: "Delete failed" });
    }
};

exports.updateMessage = async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);
        if (!message) return res.status(404).json({ error: "Not found" });
        if (message.author !== req.user.username) return res.status(403).json({ error: "Unauthorized" });

        message.title = req.body.title || message.title; 
        message.text = req.body.text || message.text;
        await message.save();
        res.json(message);
    } catch (err) {
        res.status(500).json({ error: "Update failed" });
    }
};


// Function to handle upvotes and downvotes
exports.voteMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { type } = req.body; // Expects 'up' or 'down'
        const userId = req.user.userID; // From Auth middleware

        const message = await Message.findById(id);
        if (!message) return res.status(404).json({ error: "Message not found" });

        if (type === 'up') {
            // Remove from downvotes if exists
            message.downvotes = message.downvotes.filter(uid => uid.toString() !== userId);
            
            // Toggle upvote
            if (message.upvotes.includes(userId)) {
                message.upvotes = message.upvotes.filter(uid => uid.toString() !== userId);
            } else {
                message.upvotes.push(userId);
            }
        } else if (type === 'down') {
            // Remove from upvotes if exists
            message.upvotes = message.upvotes.filter(uid => uid.toString() !== userId);
            
            // Toggle downvote
            if (message.downvotes.includes(userId)) {
                message.downvotes = message.downvotes.filter(uid => uid.toString() !== userId);
            } else {
                message.downvotes.push(userId);
            }
        }

        await message.save();
        res.json({ 
            success: true,
            upvotes: message.upvotes.length, 
            downvotes: message.downvotes.length 
        });
    } catch (err) {
        res.status(500).json({ error: "Voting failed" });
    }
};


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


exports.getComments = async (req, res) => {
    try {
        const comments = await Comment.find({ postID: req.params.id }).sort({ createdAt: 1 });
        console.log("DEBUG - Fetched Comments:", comments.length);
        res.json(comments);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch comments" });
    }
};

exports.deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) return res.status(404).json({ error: "Comment not found" });

        console.log("DEBUG - Delete Attempt:", {
            commentUserID: comment.userID.toString(),
            requestUserID: req.user.userID
        });

        // Check if the user is the author of the comment
        if (comment.userID.toString() !== req.user.userID) {
            return res.status(403).json({ error: "Unauthorized: You can only delete your own comments" });
        }

        await Comment.findByIdAndDelete(req.params.id);
        res.json({ message: "Comment deleted successfully" });
    } catch (err) {
        console.error("DEBUG - Delete Error:", err);
        res.status(500).json({ error: "Failed to delete comment" });
    }
};