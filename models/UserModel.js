const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../appConstants");
const { ObjectId } = mongoose.Schema.Types;

const userSchema = new mongoose.Schema({
  username: {
    type: String,
  },
  name: {
    type: String,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  profilePic: {
    type: String,
    default:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDVO09x_DXK3p4Mt1j08Ab0R875TdhsDcG2A&usqp=CAU",
  },
  following: [{ type: ObjectId, ref: "Users" }],
  followers: [{ type: ObjectId, ref: "Users" }],
  resetPasswordExpiresIn: {
    type: Date,
  },
  resetPasswordToken: {
    type: String,
  },
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

userSchema.methods.getJSONToken = async function () {
  let id = this._id;
  let JSONToken = await jwt.sign({ id }, JWT_SECRET);
  return JSONToken;
};

userSchema.methods.generateResetPasswordToken = async function () {
  this.resetPasswordToken = await crypto.randomBytes(20).toString("hex");
  this.resetPasswordExpiresIn = Date.now() + 3600000;
};

const User = mongoose.model("Users", userSchema);
module.exports = User;
