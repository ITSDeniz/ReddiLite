import { useState } from "react";

function CreatePost({onPostCreated, currentUser}){
     const [title, setTitle] = useState('');
     const [text, setText] = useState('');
     const [community, setCommunity] = useState('');

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
                body: JSON.stringify({ title, text, community: community || 'general' })
            });
            
            if(response.ok){
                setTitle('');
                setText('');
                setCommunity('');
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
    backgroundColor: 'white',
    padding: '15px',
    borderRadius: '4px',
    marginBottom: '20px',
    border: '1px solid #ccc'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  input: {
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #eee',
    backgroundColor: '#f6f7f8',
    color: '#1c1c1c',
    fontFamily: 'inherit'
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








