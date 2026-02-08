import { useState } from "react";

function PostCard({ post, onVote }) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [shareText, setShareText] = useState('🔗 Share');
  const [summary, setSummary] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  const token = localStorage.getItem('token');

  const score = (post.upvotes?.length || 0) - (post.downvotes?.length || 0);

  const handleSummarize = async () => {
    if (summary) {
      setSummary(''); // Toggle off
      return;
    }
    setLoadingSummary(true);
    try {
      const response = await fetch(`http://localhost:3000/api/messages/${post._id}/summarize`);
      const data = await response.json();
      setSummary(data.summary || 'Could not summarize this post.');
    } catch (err) {
      console.error("Error summarizing:", err);
      setSummary('Error fetching summary.');
    } finally {
      setLoadingSummary(false);
    }
  };

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

  const getAvatarColor = (name) => {
    const colors = ['#FF4500', '#0079D3', '#FFD500', '#46D160', '#7193FF', '#FFB000'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
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
          <div className="post-meta" style={{ display: 'flex', alignItems: 'center', fontSize: '12px', color: '#787c7e', gap: '8px' }}>
            <div style={{ 
              width: '20px', 
              height: '20px', 
              borderRadius: '50%', 
              backgroundColor: getAvatarColor(post.author || 'A'),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '10px',
              fontWeight: 'bold'
            }}>
              {post.author?.[0].toUpperCase()}
            </div>
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
        
        {post.imageURL && (
          <div style={{ margin: '10px 0', borderRadius: '4px', overflow: 'hidden', border: '1px solid #eee' }}>
            <img src={post.imageURL} alt="post" style={{ width: '100%', maxHeight: '512px', objectFit: 'contain', display: 'block' }} />
          </div>
        )}

        <div className="post-text" style={{ padding: '8px 0', fontSize: '14px' }}>{post.text}</div>
        
        {summary && (
          <div className="ai-summary" style={styles.summaryBox}>
            <small style={{ color: '#0079d3', fontWeight: 'bold' }}>✨ AI SUMMARY:</small>
            <p style={{ margin: '4px 0', fontSize: '13px', fontStyle: 'italic' }}>{summary}</p>
          </div>
        )}

        <div className="post-footer" style={styles.actions}>
          <span onClick={toggleComments} style={{ cursor: 'pointer' }}>💬 {comments.length > 0 ? comments.length : ''} Comments</span>
          <span onClick={handleSummarize} style={{ cursor: 'pointer', color: '#0079d3' }}>
            {loadingSummary ? '⚡ Summarizing...' : (summary ? '❌ Hide Summary' : '✨ Summarize')}
          </span>
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
  summaryBox: {
    backgroundColor: '#f6f7f8',
    padding: '10px',
    borderRadius: '4px',
    borderLeft: '4px solid #0079d3',
    marginTop: '8px',
    marginBottom: '8px'
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