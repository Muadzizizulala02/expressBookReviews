const axios = require("axios");

const BASE_URL = process.env.BOOKSHOP_URL || "http://localhost:5000";
const client = axios.create({ baseURL: BASE_URL, timeout: 5000 });

// Shared error handler: logs a readable message and rethrows for the caller
const handleError = (operation, error) => {
  const status = error.response ? error.response.status : "no response";
  const message = error.response && error.response.data && error.response.data.message
    ? error.response.data.message
    : error.message;
  console.error(`${operation} failed (${status}): ${message}`);
  throw error;
};

// 1. Get the full list of books
const getAllBooks = async () => {
  try {
    const response = await client.get("/");
    return response.data;
  } catch (error) {
    return handleError("getAllBooks", error);
  }
};

// 2. Get a book by ISBN
const getBookByISBN = async (isbn) => {
  try {
    const response = await client.get(`/isbn/${encodeURIComponent(isbn)}`);
    return response.data;
  } catch (error) {
    return handleError("getBookByISBN", error);
  }
};

// 3. Get all books by author
const getBooksByAuthor = async (author) => {
  try {
    const response = await client.get(`/author/${encodeURIComponent(author)}`);
    return response.data;
  } catch (error) {
    return handleError("getBooksByAuthor", error);
  }
};

// 4. Get all books by title
const getBooksByTitle = async (title) => {
  try {
    const response = await client.get(`/title/${encodeURIComponent(title)}`);
    return response.data;
  } catch (error) {
    return handleError("getBooksByTitle", error);
  }
};

module.exports = {
  getAllBooks,
  getBookByISBN,
  getBooksByAuthor,
  getBooksByTitle,
};

// Demo when run directly: node client/general.js
if (require.main === module) {
  (async () => {
    console.log("All books:", await getAllBooks());
    console.log("ISBN 1:", await getBookByISBN("1"));
    console.log("Author 'Jane Austen':", await getBooksByAuthor("Jane Austen"));
    console.log("Title 'Pride and Prejudice':", await getBooksByTitle("Pride and Prejudice"));
  })().catch(() => process.exitCode = 1);
}
