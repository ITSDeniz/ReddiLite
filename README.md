# ReddiLite 🚀

ReddiLite is a modern, lightweight "Mini Reddit" clone built with Node.js, Express, and MongoDB Atlas.

## ✨ Features

- 🔐 **Authentication:** Secure sign-up and login system using JWT (JSON Web Token) and bcrypt.
- 📝 **Post Creation:** Share posts with a title, content, and community tags.
- 🗳️ **Voting System:** Upvote or downvote posts to influence their ranking.
- 💬 **Comments:** Add comments to posts and view discussions.
- 🎨 **Modern UI:** Responsive design built with Bootstrap 5, featuring a Reddit-inspired color palette.

## 🛠️ Technologies

- **Frontend:** HTML5, CSS3 (Bootstrap 5), JavaScript (Fetch API)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas (Mongoose)
- **Security:** JWT, Bcrypt, Dotenv

## 🚀 Installation & Setup

1. Clone the repository:
   ```bash
   git clone <github-repo-url>
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory and add your credentials:
   ```env
   PORT=3000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   ```
4. Start the application:
   ```bash
   node server.js
   ```
---
