const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authenticateToken = require('../middleware/auth');

// Post operations
router.get('/', messageController.getMessages);
router.post('/', authenticateToken, messageController.createMessage);
router.delete('/:id', authenticateToken, messageController.deleteMessage);
router.put('/:id', authenticateToken, messageController.updateMessage);
router.post('/:id/vote', authenticateToken, messageController.voteMessage); // Voting route
router.get('/:id/summarize', messageController.summarizeMessage); // AI Summarization route

// Comment operations
router.get('/:id/comments', messageController.getComments); // Everyone can see comments
router.post('/:id/comments', authenticateToken, messageController.addComment); // Must be logged in to comment
router.delete('/comments/:id', authenticateToken, messageController.deleteComment); // Delete comment

module.exports = router;