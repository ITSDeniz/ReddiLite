import { useState, useEffect } from 'react';
import PostCard from './components/PostCard';
import './App.css';
import CreatePost from './components/CreatePost';
import Auth from './components/Auth';

function App() {
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(localStorage.getItem('username') || null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/messages');
      const data = await response.json();
      setPosts(data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const handleLogin = (username) => {
    setCurrentUser(username);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setCurrentUser(null);
  };

  const handleVote = async (postId, voteType) => {
    try {
      const token = localStorage.getItem('token'); 
      if (!token) {
        alert("You must be logged in to vote.");
        return;
      }
      
      const response = await fetch(`http://localhost:3000/api/messages/${postId}/vote`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ type: voteType })
      });

      if (response.ok) {
        fetchPosts(); 
      } else {
        const errorData = await response.json();
        console.error("Vote failed:", errorData.error);
        alert(errorData.error);
      }
    } catch (err) {
      console.error("Vote error:", err);
    }
  };

  return (
    <div className="app-container">
      <header className="navbar">
        <div className="navbar-content">
          <h1>ReddiLite</h1>
          <Auth 
            currentUser={currentUser} 
            onLogin={handleLogin} 
            onLogout={handleLogout} 
          />
        </div>
      </header>
      <main className="feed">
        <CreatePost onPostCreated={fetchPosts} currentUser={currentUser} /> 
        
        {posts.length === 0 ? (
          <p>No posts yet or backend is offline...</p>
        ) : (
          posts.map(post => (
            <PostCard 
              key={post._id} 
              post={post} 
              onVote={handleVote} 
            />
          ))
        )}
      </main>
    </div>
  );
}

export default App;