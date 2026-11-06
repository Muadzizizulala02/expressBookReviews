const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;
const { JWT_SECRET } = require('./router/auth_users.js');

const app = express();

app.use(express.json());

app.use("/customer", session({
  secret: process.env.SESSION_SECRET || "fingerprint_customer",
  resave: true,
  saveUninitialized: true,
}));

// Verifies the JWT stored in the session for every protected /customer/auth route
app.use("/customer/auth/*", function auth(req, res, next) {
  const authorization = req.session && req.session.authorization;

  if (!authorization || !authorization.accessToken) {
    return res.status(403).json({ message: "User not logged in" });
  }

  jwt.verify(authorization.accessToken, JWT_SECRET, (err, payload) => {
    if (err) {
      return res.status(403).json({ message: "User not authenticated" });
    }
    req.user = { username: payload.data };
    return next();
  });
});

const PORT = process.env.PORT || 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
