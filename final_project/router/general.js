const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const NOT_FOUND = (res, what) =>
  res.status(404).json({ message: `No ${what} found` });

// Turn the books map into an array of books that include their ISBN
const toBookList = (entries) =>
  entries.map(([isbn, book]) => ({ isbn, ...book }));

const containsIgnoreCase = (value, term) =>
  String(value).toLowerCase().includes(String(term).toLowerCase());

// Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (!isValid(username)) {
    return res.status(409).json({ message: "Username is invalid or already taken" });
  }

  users.push({ username, password });

  return res.status(201).json({
    message: `User ${username} successfully registered. Now you can login`,
  });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  return res.status(200).json(books);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const { isbn } = req.params;
  const book = books[isbn];

  if (!book) {
    return NOT_FOUND(res, `book with ISBN ${isbn}`);
  }

  return res.status(200).json({ isbn, ...book });
});

// Get book details based on author (case-insensitive, partial match)
public_users.get('/author/:author', function (req, res) {
  const { author } = req.params;
  const matches = toBookList(
    Object.entries(books).filter(([, book]) => containsIgnoreCase(book.author, author))
  );

  if (matches.length === 0) {
    return NOT_FOUND(res, `book by author ${author}`);
  }

  return res.status(200).json(matches);
});

// Get all books based on title (case-insensitive, partial match)
public_users.get('/title/:title', function (req, res) {
  const { title } = req.params;
  const matches = toBookList(
    Object.entries(books).filter(([, book]) => containsIgnoreCase(book.title, title))
  );

  if (matches.length === 0) {
    return NOT_FOUND(res, `book with title ${title}`);
  }

  return res.status(200).json(matches);
});

// Get book reviews
public_users.get('/review/:isbn', function (req, res) {
  const { isbn } = req.params;
  const book = books[isbn];

  if (!book) {
    return NOT_FOUND(res, `book with ISBN ${isbn}`);
  }

  return res.status(200).json({ isbn, title: book.title, reviews: book.reviews });
});

module.exports.general = public_users;
