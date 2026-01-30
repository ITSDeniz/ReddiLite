try {
    const bcrypt = require('bcrypt');
    console.log("Bcrypt loaded successfully");
    bcrypt.hash('test', 10).then(hash => {
        console.log("Hash created:", hash);
    }).catch(err => {
        console.error("Hash error:", err);
    });
} catch (e) {
    console.error("Failed to load bcrypt:", e.message);
}