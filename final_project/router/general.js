const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const doesExist = (username) => {
    // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

public_users.post("/register", (req,res) => {
  //Write your code here
  const username = req.body.username; 
  const password = req.body.password; 
  // Check if both username and password are provided 
  if (!username || !password) { 
    return res.status(400).json({ message: "Username and password are required" }); 
  } 
  
  // Check if the user already exists 
  if (doesExist(username)) { 
    return res.status(409).json({ message: "User already exists!" }); 
  } 
  
  // Add the new user to the users array 
  users.push({ "username": username, "password": password }); 
  return res.status(201).json({ message: "User successfully registered. Now you can login" });
});

const getBooks = () => { 
    return new Promise((resolve, reject) => { 
        if (books) { 
            resolve(books); 
        } else { 
            reject("Error"); 
        } 
    }); 
} 
 
public_users.get('/', (req, res) => { 
    getBooks() 
    .then(books => res.send(JSON.stringify(books, null, 4))) 
    .catch(error => res.status(500).json({ message: error })); 
});

const getBookByISBN = (isbn) => { 
    return new Promise((resolve, reject) => { 
        const book = books[isbn]; 
        if (book) { 
            resolve(book); 
        } else { 
            reject("Book not found"); 
        } 
    }); 
} 

// Get book details based on ISBN 
public_users.get('/isbn/:isbn', (req, res) => { 
    const isbn = req.params.isbn; 
    getBookByISBN(isbn) 
      .then(book => res.send(JSON.stringify(book, null, 4))) 
      .catch(error => res.status(404).json({ message: error })); 
});
  
const getBooksByAuthor = (author) => { 
    return new Promise((resolve, reject) => { 
        let booksByAuthor = []; 
        for (let isbn in books) { 
            if (books[isbn].author === author) { 
                booksByAuthor.push(books[isbn]); 
            } 
        } 
        if (booksByAuthor.length > 0) { 
            resolve(booksByAuthor); 
        } else { 
            reject("No books found by this author"); 
        } 
    }); 
} 

// Get book details based on Author 
public_users.get('/author/:author', (req, res) => { 
    const author = req.params.author; 
    getBooksByAuthor(author) 
    .then(books => res.json(books)) 
    .catch(error => res.status(404).json({ message: error })); 
});

const getBooksByTitle = (title) => { 
    return new Promise((resolve, reject) => { 
        let booksByTitle = []; 
        for (let isbn in books) { 
            if (books[isbn].title === title) { 
                booksByTitle.push(books[isbn]); 
            } 
        } 
        if (booksByTitle.length > 0) { 
            resolve(booksByTitle); 
        } else { 
            reject("No books found with this title"); 
        } 
    }); 
} 

// Get book details based on Title 
public_users.get('/title/:title', (req, res) => { 
    const title = req.params.title; 
    getBooksByTitle(title) 
      .then(books => res.json(books)) 
      .catch(error => res.status(404).json({ message: error })); 
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  // Retrieve the ISBN from the request parameters 
  const isbn = req.params.isbn; 
  // Find the book reviews using the ISBN 
  const book = books[isbn]; 
  // Check if the book exists 
  if (book) { 
    // Send the book reviews as a JSON response 
    res.json(book.reviews); 
  } else { 
    // Send a 404 response if the book is not found 
    res.status(404).json({ message: "Book not found" }); }
  //return res.status(300).json({message: "Yet to be implemented"});
});

module.exports.general = public_users;
