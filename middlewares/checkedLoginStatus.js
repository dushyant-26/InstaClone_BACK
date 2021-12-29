const { JWT_SECRET } = require("../appConstants");
const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");

const checkedLoginStatus = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: "You need to login!" });
  }

  const token = authorization.replace("Bearer ", "");
  jwt.verify(token, JWT_SECRET, async (err, payload) => {
    if (err) {
      return res.status(401).json({ error: "You need to login!" });
    }
    const { id } = payload;
    let user = await User.findById(id);
    req.user = user;
    next();
  });
};

module.exports = checkedLoginStatus;
