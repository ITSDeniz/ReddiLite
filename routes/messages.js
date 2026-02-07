const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authenticateToken = require('../middleware/auth');

// Post (Mesaj) işlemleri
router.get('/', messageController.getMessages);
router.post('/', authenticateToken, messageController.createMessage);
router.delete('/:id', authenticateToken, messageController.deleteMessage);
router.put('/:id', authenticateToken, messageController.updateMessage);
router.post('/:id/vote', authenticateToken, messageController.voteMessage); // Oylama rotası

// Yorum işlemleri
router.get('/:id/comments', messageController.getComments); // Yorumları herkes görebilir
router.post('/:id/comments', authenticateToken, messageController.addComment); // Yorum yapmak için giriş şart
router.delete('/comments/:id', authenticateToken, messageController.deleteComment); // Yorum silme

module.exports = router;