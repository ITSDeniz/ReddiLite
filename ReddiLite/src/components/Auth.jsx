import { useState } from 'react';

function Auth({ onLogin, onLogout, currentUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleModal = () => {
    setIsOpen(!isOpen);
    setIsLogin(true);
    setUsername('');
    setPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const endpoint = isLogin ? 'login' : 'register';
    try {
      const response = await fetch(`http://localhost:3000/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();

      if (response.ok) {
        if (isLogin) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('username', data.username);
          localStorage.setItem('userID', data.userID);
          onLogin(data.username);
          toggleModal();
        } else {
          alert('Registration successful! Please login.');
          setIsLogin(true);
        }
      } else {
        alert(data.error || 'Authentication failed');
      }
    } catch (err) {
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (currentUser) {
    return (
      <div style={styles.authInfo}>
        <span style={styles.userName}>u/<b>{currentUser}</b></span>
        <button onClick={onLogout} style={styles.logoutBtn}>Logout</button>
      </div>
    );
  }

  return (
    <>
      <div style={styles.navButtons}>
        <button onClick={() => { setIsOpen(true); setIsLogin(true); }} style={styles.loginNavBtn}>Log In</button>
        <button onClick={() => { setIsOpen(true); setIsLogin(false); }} style={styles.signUpNavBtn}>Sign Up</button>
      </div>

      {isOpen && (
        <div style={styles.modalOverlay} onClick={toggleModal}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button style={styles.closeBtn} onClick={toggleModal}>&times;</button>
            
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>{isLogin ? 'Log In' : 'Sign Up'}</h2>
              <p style={styles.modalSubtitle}>
                By continuing, you agree to our User Agreement and Privacy Policy.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.inputGroup}>
                <input
                  type="text"
                  placeholder="USERNAME"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.inputGroup}>
                <input
                  type="password"
                  placeholder="PASSWORD"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>
              
              <button type="submit" style={styles.submitBtn} disabled={loading}>
                {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Sign Up')}
              </button>
            </form>

            <div style={styles.footer}>
              {isLogin ? (
                <span>New to ReddiLite? <a href="#" onClick={() => setIsLogin(false)} style={styles.link}>SIGN UP</a></span>
              ) : (
                <span>Already a Redditor? <a href="#" onClick={() => setIsLogin(true)} style={styles.link}>LOG IN</a></span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  navButtons: {
    display: 'flex',
    gap: '10px'
  },
  loginNavBtn: {
    padding: '6px 20px',
    borderRadius: '20px',
    border: '1px solid #0079d3',
    backgroundColor: 'transparent',
    color: '#0079d3',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  signUpNavBtn: {
    padding: '6px 20px',
    borderRadius: '20px',
    border: 'none',
    backgroundColor: '#0079d3',
    color: 'white',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modalContent: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '400px',
    position: 'relative',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
  },
  closeBtn: {
    position: 'absolute',
    top: '15px',
    right: '15px',
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#878a8c'
  },
  modalHeader: {
    marginBottom: '30px'
  },
  modalTitle: {
    margin: '0 0 10px 0',
    fontSize: '20px',
    fontWeight: '500'
  },
  modalSubtitle: {
    fontSize: '12px',
    color: '#1c1c1c',
    margin: 0
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  inputGroup: {
    width: '100%'
  },
  input: {
    width: '100%',
    padding: '15px',
    borderRadius: '4px',
    border: '1px solid #edeff1',
    backgroundColor: '#f6f7f8',
    fontSize: '14px',
    boxSizing: 'border-box'
  },
  submitBtn: {
    padding: '12px',
    backgroundColor: '#0079d3',
    color: 'white',
    border: 'none',
    borderRadius: '25px',
    fontWeight: 'bold',
    fontSize: '14px',
    cursor: 'pointer',
    marginTop: '10px'
  },
  footer: {
    marginTop: '20px',
    fontSize: '12px',
    color: '#1c1c1c'
  },
  link: {
    color: '#0079d3',
    textDecoration: 'none',
    fontWeight: 'bold',
    marginLeft: '5px'
  },
  authInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  userName: {
    fontSize: '14px',
    color: '#1c1c1c'
  },
  logoutBtn: {
    padding: '6px 20px',
    borderRadius: '20px',
    border: '1px solid #0079d3',
    backgroundColor: 'transparent',
    color: '#0079d3',
    fontWeight: 'bold',
    cursor: 'pointer'
  }
};

export default Auth;
