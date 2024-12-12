const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [{
    "username": "newuser",
    "password": "mypassword123"
  }];

const isValid = (username)=>{ //returns boolean
return users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
const user = users.find(user => user.username === username);
  return user && user.password === password;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const { username, password } = req.body;
    console.log(username)
    console.log(password)
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    if (authenticatedUser(username, password)) {
      const token = jwt.sign({ username }, "your_secret_key", { expiresIn: '1h' });
      return res.status(200).json({ message: "Login successful", token });
    } else {
      return res.status(401).json({ message: "Invalid username or password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const { review } = req.body;
    const username = req.user.username; // Assume `req.user` is populated via authentication middleware.
  
    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }
  
    if (!review) {
      return res.status(400).json({ message: "Review content is required" });
    }
  
    if (!books[isbn].reviews) {
      books[isbn].reviews = {};
    }
  
    books[isbn].reviews[username] = review;
    return res.status(200).json({ message: "Review added/updated successfully", reviews: books[isbn].reviews });
  
});

// Delete a review for a book 
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = 1;
    const username = req.user.username; // Get the username from the token

    // Check if the book exists
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Check if the book has reviews
    if (!books[isbn].reviews || !books[isbn].reviews[username]) {
        return res.status(400).json({ message: "Review not found for this book" });
    }

    // Delete the review by the username
    delete books[isbn].reviews[username];

    // Return a success message and the updated reviews
    return res.status(200).json({ message: "Review deleted successfully", reviews: books[isbn].reviews });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
