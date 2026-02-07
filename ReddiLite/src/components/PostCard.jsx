import { useState } from "react";

function PostCard({ post, onVote }) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [shareText, setShareText] = useState('🔗 Share');
  const token = localStorage.getItem('token');

  const score = (post.upvotes?.length || 0) - (post.downvotes?.length || 0);
  const currentUserID = localStorage.getItem('userID');
  const isUpvoted = post.upvotes?.includes(currentUserID);
  const isDownvoted = post.downvotes?.includes(currentUserID);

  const handleShare = async () => {
    const shareData = {
      title: post.title,
      text: `Check out this post on ReddiLite: ${post.title}`,
      url: window.location.href, // Since it's a SPA, we share the main page or we could share a specific post link if we had routing
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShareText('✅ Link Copied!');
        setTimeout(() => setShareText('🔗 Share'), 2000);
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  const toggleComments = async () => {
    if (!showComments) {
      await fetchComments();
    }
    setShowComments(!showComments);
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/messages/${post._id}/comments`);
      const data = await response.json();
      setComments(data);
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await fetch(`http://localhost:3000/api/messages/${post._id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: newComment })
      });

      if (response.ok) {
        setNewComment('');
        fetchComments();
      }
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;

    try {
      const response = await fetch(`http://localhost:3000/api/messages/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchComments();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete comment");
      }
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      const response = await fetch(`http://localhost:3000/api/messages/${post._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        window.location.reload(); // Refresh to update the feed
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete post");
      }
    } catch (err) {
      console.error("Error deleting post:", err);
    }
  };

  return (
    <div className="post-card" style={styles.card}>
      <div className="vote-column" style={styles.voteSidebar}>
        <button 
          onClick={() => onVote(post._id, 'up')} 
          className="vote-btn" 
          style={{...styles.arrow, color: isUpvoted ? '#ff4500' : '#878a8c'}}
        >
          ▲
        </button>
        <span className="score-text" style={{
          ...styles.score, 
          color: isUpvoted ? '#ff4500' : (isDownvoted ? '#7193ff' : '#1c1c1c')
        }}>
          {score}
        </span>
        <button 
          onClick={() => onVote(post._id, 'down')} 
          className="vote-btn" 
          style={{...styles.arrow, color: isDownvoted ? '#7193ff' : '#878a8c'}}
        >
          ▼
        </button>
      </div>

      <div className="content-column" style={styles.content}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="post-meta" style={{ fontSize: '12px', color: '#787c7e' }}>
            r/{post.community || 'general'} • Posted by u/{post.author}
          </div>
          {localStorage.getItem('userID') === post.userID && (
            <button 
              onClick={handleDeletePost} 
              style={styles.deletePostBtn}
              title="Delete post"
            >
              🗑️
            </button>
          )}
        </div>
        <div className="post-title" style={{ fontSize: '18px', fontWeight: '600', padding: '4px 0' }}>{post.title}</div>
        <div className="post-text" style={{ padding: '8px 0', fontSize: '14px' }}>{post.text}</div>
        <div className="post-footer" style={styles.actions}>
          <span onClick={toggleComments} style={{ cursor: 'pointer' }}>💬 {comments.length > 0 ? comments.length : ''} Comments</span>
          <span onClick={handleShare} style={{ cursor: 'pointer' }}>{shareText}</span>
        </div>

        {showComments && (
          <div className="comments-section" style={styles.commentSection}>
            <div className="comments-list">
              {comments.length === 0 ? (
                <small style={{ color: '#878a8c' }}>No comments yet.</small>
              ) : (
                comments.map((c) => (
                  <div key={c._id} style={styles.comment}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <small><b>u/{c.author}</b></small>
                      {localStorage.getItem('userID') === c.userID && (
                        <button 
                          onClick={() => handleDeleteComment(c._id)} 
                          style={styles.deleteCommentBtn}
                          title="Delete comment"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                    <p style={{ margin: '4px 0', fontSize: '13px' }}>{c.text}</p>
                  </div>
                ))
              )}
            </div>
            
            {token ? (
              <form onSubmit={handleAddComment} style={styles.commentForm}>
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  style={styles.commentInput}
                />
                <button type="submit" style={styles.commentSubmit}>Post</button>
              </form>
            ) : (
              <small style={{ color: '#ff4500' }}>Log in to comment.</small>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  card: {
    display: 'flex',
    backgroundColor: 'white',
    border: '1px solid #ccc',
    borderRadius: '4px',
    marginBottom: '10px',
    overflow: 'hidden',
    textAlign: 'left',
    width: '100%',
    boxSizing: 'border-box'
  },
  voteSidebar: {
    width: '40px',
    backgroundColor: '#f8f9fa',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '8px 4px',
    color: '#878a8c'
  },
  arrow: { 
    cursor: 'pointer', 
    fontSize: '20px',
    background: 'none',
    border: 'none',
    color: '#878a8c'
  },
  score: { 
    fontWeight: 'bold', 
    margin: '5px 0',
    fontSize: '12px'
  },
  content: {
    padding: '8px 12px',
    flex: 1,
    minWidth: 0
  },
  actions: {
    display: 'flex',
    gap: '15px',
    fontSize: '12px',
    color: '#878a8c',
    fontWeight: 'bold',
    marginTop: '10px'
  },
  commentSection: {
    marginTop: '15px',
    paddingTop: '10px',
    borderTop: '1px solid #eee'
  },
  comment: {
    borderLeft: '2px solid #edeff1',
    paddingLeft: '10px',
    marginBottom: '10px'
  },
  deletePostBtn: {
    background: 'none',
    border: 'none',
    color: '#ed4337',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    padding: '2px 8px',
    borderRadius: '4px'
  },
  deleteCommentBtn: {
    background: 'none',
    border: 'none',
    color: '#878a8c',
    fontSize: '12px',
    cursor: 'pointer',
    padding: '0 5px',
    lineHeight: '1'
  },
  commentForm: {
    display: 'flex',
    gap: '5px',
    marginTop: '10px'
  },
  commentInput: {
    flex: 1,
    padding: '5px 10px',
    borderRadius: '4px',
    border: '1px solid #eee',
    fontSize: '13px'
  },
  commentSubmit: {
    backgroundColor: '#0079d3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '5px 10px',
    cursor: 'pointer',
    fontWeight: 'bold'
  }
};

export default PostCard;