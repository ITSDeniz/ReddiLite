import { useState } from "react";

function CreatePost({onPostCreated, currentUser}){
     const [title, setTitle] = useState('');
     const [text, setText] = useState('');
     const [community, setCommunity] = useState('');
     const [imageURL, setImageURL] = useState('');

     if (!currentUser) return null;

     const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !text.trim()) return;
    
        try{
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ title, text, imageURL, community: community || 'general' })
            });
            
            if(response.ok){
                setTitle('');
                setText('');
                setCommunity('');
                setImageURL('');
                onPostCreated();
            } else if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('token');
                localStorage.removeItem('username');
                alert("Session expired. Please log in again.");
                window.location.reload();
            } else {
                const errorData = await response.json();
                alert(errorData.error || "Failed to create post.");
            }
        } catch (err){
            console.error("Post creation failed:", err);
        }
    };

    return (
        <div className="create-post-container" style={styles.container}>
            <h3 style={{marginTop: 0, fontSize: '16px'}}>Create a Post</h3>
            <form onSubmit={handleSubmit} style={styles.form}>
                <input 
                  type="text"
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={styles.input} 
                />
                <input 
                  type="text"
                  placeholder="Community (optional)"
                  value={community}
                  onChange={(e) => setCommunity(e.target.value)}
                  style={styles.input} 
                />
                <input 
                  type="text"
                  placeholder="Image URL (optional)"
                  value={imageURL}
                  onChange={(e) => setImageURL(e.target.value)}
                  style={styles.input} 
                />
                <textarea 
                  placeholder="What are you thinking?"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  style={{...styles.input, height: '80px', resize: 'vertical'}} 
                />
                <button type="submit" style={styles.button}>Post</button>
            </form>
        </div>
    );
}

const styles = {
  container: {
    backgroundColor: 'var(--card-bg, rgba(255, 255, 255, 0.6))',
    border: '1px solid var(--border-color, rgba(255, 255, 255, 0.3))',
    padding: '15px',
    borderRadius: '16px',
    marginBottom: '20px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
    transition: 'all 0.3s ease'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  input: {
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--input-bg, rgba(255, 255, 255, 0.4))',
    color: 'var(--text-color)',
    fontFamily: 'inherit',
    transition: 'all 0.3s ease'
  },
  button: {
    alignSelf: 'flex-end',
    padding: '10px 20px',
    backgroundColor: '#0079d3',
    color: 'white',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    fontWeight: 'bold'
  }
};

export default CreatePost;








