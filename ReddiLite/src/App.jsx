import { useState, useEffect } from 'react';
import PostCard from './components/PostCard';
import './App.css';
import CreatePost from './components/CreatePost';
import Auth from './components/Auth';

function App() {
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(localStorage.getItem('username') || null);
  const [sortBy, setSortBy] = useState('new'); // 'new' or 'top'

  useEffect(() => {
    fetchPosts();
  }, [sortBy]); // Refetch when sorting changes

  const fetchPosts = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/messages`);
      let data = await response.json();
      
      if (sortBy === 'top') {
        data.sort((a, b) => (b.upvotes.length - b.downvotes.length) - (a.upvotes.length - a.upvotes.length));
      } else {
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
      
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1 }}>
            <h1 style={{ cursor: 'pointer' }} onClick={() => window.location.reload()}>ReddiLite</h1>
            <div className="search-container" style={{ flex: 1, maxWidth: '500px', position: 'relative' }}>
              <input 
                type="text" 
                placeholder="🔍 Search ReddiLite" 
                style={styles.searchInput}
              />
            </div>
          </div>
          <Auth 
            currentUser={currentUser} 
            onLogin={handleLogin} 
            onLogout={handleLogout} 
          />
        </div>
      </header>
      
      <div className="main-layout" style={styles.mainLayout}>
        <main className="feed" style={styles.feed}>
          <div className="sort-tabs" style={styles.sortTabs}>
            <button 
              onClick={() => setSortBy('new')} 
              style={{...styles.tabBtn, color: sortBy === 'new' ? '#0079d3' : '#878a8c'}}
            >
              🆕 New
            </button>
            <button 
              onClick={() => setSortBy('top')} 
              style={{...styles.tabBtn, color: sortBy === 'top' ? '#0079d3' : '#878a8c'}}
            >
              🔥 Top
            </button>
          </div>

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

        <aside className="sidebar" style={styles.sidebar}>
          <div style={styles.sidebarCard}>
            <div style={{
              height: '34px',
              backgroundColor: '#0079d3',
              margin: '-12px -12px 10px -12px',
              borderRadius: '4px 4px 0 0'
            }}></div>
            <h3 style={{ marginTop: 0 }}>About Community</h3>
            <p style={{ fontSize: '14px' }}>Welcome to ReddiLite! The front page of your own local internet.</p>
            <div style={styles.stats}>
              <div><strong>1.2k</strong><br/><small>Members</small></div>
              <div><strong>45</strong><br/><small>Online</small></div>
            </div>
            <button style={styles.sidebarBtn}>Join Community</button>
          </div>

          <div style={styles.sidebarCard}>
            <h3 style={{ fontSize: '14px', color: '#878a8c', marginBottom: '12px' }}>TRENDING COMMUNITIES</h3>
            <div style={styles.communityList}>
              {['tech', 'gaming', 'worldnews', 'movies', 'science'].map((name, i) => (
                <div key={name} style={styles.communityItem}>
                  <span>{i + 1}</span>
                  <div style={{ 
                    width: '24px', 
                    height: '24px', 
                    borderRadius: '50%', 
                    backgroundColor: '#ff4500',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '10px'
                  }}>r/</div>
                  <strong style={{ fontSize: '13px' }}>r/{name}</strong>
                </div>
              ))}
            </div>
            <button style={{...styles.sidebarBtn, backgroundColor: '#edeff1', color: '#0079d3', marginTop: '15px'}}>View All</button>
          </div>

          <div style={styles.sidebarCard}>
            <h3 style={{ fontSize: '14px' }}>Rules</h3>
            <ul style={styles.rulesList}>
              <li>1. Be respectful to others</li>
              <li>2. No spam or self-promotion</li>
              <li>3. Use descriptive titles</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

const styles = {
  mainLayout: {
    display: 'flex',
    justifyContent: 'center',
    gap: '24px',
    maxWidth: '1000px',
    margin: '20px auto',
    padding: '0 20px'
  },
  feed: {
    flex: 1,
    minWidth: 0
  },
  sidebar: {
    width: '312px',
    display: 'none' // Hidden on small screens, will be handled by CSS
  },
  sidebarCard: {
    backgroundColor: 'white',
    border: '1px solid #ccc',
    borderRadius: '4px',
    padding: '12px',
    marginBottom: '16px'
  },
  stats: {
    display: 'flex',
    gap: '20px',
    fontSize: '14px',
    margin: '15px 0',
    borderTop: '1px solid #eee',
    paddingTop: '10px'
  },
  sidebarBtn: {
    width: '100%',
    backgroundColor: '#0079d3',
    color: 'white',
    border: 'none',
    borderRadius: '20px',
    padding: '8px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  sortTabs: {
    backgroundColor: 'white',
    border: '1px solid #ccc',
    borderRadius: '4px',
    padding: '10px',
    marginBottom: '15px',
    display: 'flex',
    gap: '15px'
  },
  tabBtn: {
    background: 'none',
    border: 'none',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '14px'
  },
  searchInput: {
    width: '100%',
    padding: '8px 15px',
    paddingLeft: '35px',
    borderRadius: '20px',
    border: '1px solid #edeff1',
    backgroundColor: '#f6f7f8',
    fontSize: '14px',
    outline: 'none'
  },
  communityList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  communityItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    borderBottom: '1px solid #f6f7f8',
    paddingBottom: '8px'
  },
  rulesList: {
    paddingLeft: '20px',
    fontSize: '13px',
    lineHeight: '1.6'
  }
};


export default App;