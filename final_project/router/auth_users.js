const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const JWT_SECRET = process.env.JWT_SECRET || "access";
const TOKEN_TTL_SECONDS = 60 * 60;

// Returns true when the username is well-formed and not yet registered.
const isValid = (username) => {
  if (typeof username !== "string" || username.trim().length === 0) {
    return false;
  }
  return !users.some((user) => user.username === username);
};

// Returns true when the username/password pair matches a registered user.
const authenticatedUser = (username, password) => {
  return users.some(
    (user) => user.username === username && user.password === password
  );
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  const accessToken = jwt.sign({ data: username }, JWT_SECRET, {
    expiresIn: TOKEN_TTL_SECONDS,
  });

  req.session.authorization = { accessToken, username };

  return res.status(200).json({
    message: "User successfully logged in",
    accessToken,
  });
});

// Add or modify a book review written by the logged-in user
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { review } = req.query;
  const { username } = req.user;

  if (!books[isbn]) {
    return res.status(404).json({ message: `No book found with ISBN ${isbn}` });
  }

  if (!review) {
    return res.status(400).json({ message: "Review text is required as the 'review' query parameter" });
  }

  const isModification = Object.prototype.hasOwnProperty.call(books[isbn].reviews, username);
  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: isModification
      ? `Review for ISBN ${isbn} modified successfully`
      : `Review for ISBN ${isbn} added successfully`,
    reviews: books[isbn].reviews,
  });
});

// Delete a book review written by the logged-in user (only their own)
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { username } = req.user;

  if (!books[isbn]) {
    return res.status(404).json({ message: `No book found with ISBN ${isbn}` });
  }

  if (!Object.prototype.hasOwnProperty.call(books[isbn].reviews, username)) {
    return res.status(404).json({
      message: `No review by ${username} found for ISBN ${isbn}`,
    });
  }

  delete books[isbn].reviews[username];

  return res.status(200).json({
    message: `Review by ${username} for ISBN ${isbn} deleted successfully`,
    reviews: books[isbn].reviews,
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
module.exports.JWT_SECRET = JWT_SECRET;
