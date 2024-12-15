const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
  return users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
  let validusers = users.filter((user) => { 
    return (user.username === username && user.password === password); 
  }); 
  return validusers.length > 0;
}

//only registered users can login
regd_users.post("/login", (req, res) => { 
    const username = req.body.username; 
    const password = req.body.password; 
    
    // Check if username or password is missing 
    if (!username || !password) { 
        return res.status(400).json({ message: "Username and password are required" }); 
    } 
    
    // Authenticate user 
    if (authenticatedUser(username, password)) { 
        // Generate JWT access token 
        let accessToken = jwt.sign({ 
            data: username 
        }, 'access', { expiresIn: 60 * 60 }); 
        
    // Store access token and username in session 
    req.session.authorization = { 
        accessToken, username 
    } 
    return res.status(200).json({ message: "User successfully logged in" }); 
    } else { 
        return res.status(401).json({ message: "Invalid Login. Check username and password" }); 
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => { 
    const isbn = req.params.isbn; 
    const review = req.query.review; 
    const username = req.session.authorization.username; 
    if (!books[isbn]) { 
        return res.status(404).json({ message: "Book not found" }); 
    } 
    if (!books[isbn].reviews) { 
        books[isbn].reviews = {}; 
    } 
    books[isbn].reviews[username] = review; 
    return res.status(200).json({ message: "Review added/modified successfully" }); 
});

regd_users.delete("/auth/review/:isbn", (req, res) => { 
    const isbn = req.params.isbn; 
    const username = req.session.authorization.username; 
    if (!books[isbn]) { 
        return res.status(404).json({ message: "Book not found" }); 
    } 
    if (books[isbn].reviews && books[isbn].reviews[username]) { 
        delete books[isbn].reviews[username]; 
        return res.status(200).json({ message: "Review deleted successfully" }); 
    } else { 
        return res.status(404).json({ message: "Review not found" }); 
    } 
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
