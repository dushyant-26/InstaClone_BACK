const express = require("express");
const User = require("../models/UserModel");
const bcrypt = require("bcryptjs");
const router = express.Router();
const checkedLoginStatus = require("../middlewares/checkedLoginStatus");
const { FRONT_END_DOMAIN } = require("../appConstants");
const removeFields = "-resetPasswordExpiresIn -resetPasswordToken";
const { sendMail } = require("../sendEmail");

router.post("/signup", async (req, res) => {
  const { username, name, email, password } = req.body;

  if (!username || !email || !password || !name)
    return res.status(400).send({ error: "Please complete all the fields" });

  try {
    let user = await User.findOne({ email: email });
    if (user) {
      return res.status(422).send({ error: "User already exists" });
    }
    user = new User({ username, email, password, name });
    await user.save();

    let html = `<div>
        <h3>Hello ${user.username} </h3>
        <p>Welcome to Instagram Clone!</p>
      </div>`;

    await sendMail(
      user.email,
      "Registration Successful",
      "Registration Successful",
      html
    );
    return res.status(201).send({ message: "Registration Successful" });
  } catch (err) {
    res.status(400).send({ error: "Error" });
  }
});

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send({ error: "Please complete all the fields" });
  }
  try {
    let user = await User.findOne({ email }).select(removeFields);
    if (!user) {
      return res.status(401).send({ error: "Invalid Email or Password" });
    }
    let match = await bcrypt.compare(password, user.password);
    if (match) {
      let jwt = await user.getJSONToken();
      user = user.toJSON();
      delete user.password;
      return res
        .status(200)
        .json({ jwt, message: "Signin Successful", userInfo: user });
    }
    return res.status(401).send({ error: "Invalid Email or Password" });
  } catch (err) {
    res.status(400).send({ error: "Error" });
  }
});

router.post("/validateUsername", async (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).send({ error: "Username Field Empty!" });
  }

  try {
    let user = await User.findOne({ username });
    if (user) {
      return res.status(401).send({ error: "Username already taken!" });
    }
    return res.status(200).send({ message: "Username Available!" });
  } catch (err) {
    res.status(400).send({ error: "Something went wrong!" });
  }
});

router.put("/reset-password", async (req, res) => {
  try {
    const { email } = req.body;

    let user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ error: "Account with this email does not exist" });
    }
    user.generateResetPasswordToken();
    await user.save();

    let html = `<div>
        <h3>Hello ${user.username} </h3>
        <p>Please click the following link to reset your password</p>
        <a href="${FRONT_END_DOMAIN}/resetPassword/${user.resetPasswordToken}"}>
          Reset Now
        </a>
      </div>`;

    await sendMail(
      user.email,
      "Reset your Password",
      "Reset Your Password",
      html
    );

    return res.send({ message: "Password Reset Link sent to your Email" });
  } catch (err) {
    res.status(422).send({ error: err });
  }
});

router.post("/validateResetPasswordToken", async (req, res) => {
  try {
    const { resetPasswordToken } = req.body;

    let user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpiresIn: { $gt: Date.now() },
    });
    if (!user) {
      return res
        .status(404)
        .json({ error: "This Link is Invalid or has Expired" });
    }

    return res.send({ message: "Link Valid" });
  } catch (err) {
    res.status(422).send({ error: err });
  }
});

router.put("/updatePassword", async (req, res) => {
  try {
    const { password, resetPasswordToken } = req.body;

    let user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpiresIn: { $gt: Date.now() },
    });
    if (!user) {
      return res
        .status(404)
        .json({ error: "This Link is Invalid or has Expired" });
    }

    user.password = password;
    user.resetPasswordExpiresIn = undefined;
    user.resetPasswordToken = undefined;
    await user.save();

    let html = `<div>
        <h3>Hello ${user.username} </h3>
        <p>Your password is successfully changed</p>
      </div>`;

    await sendMail(
      user.email,
      "Reset Password SuccessFul",
      "Reset Password SuccessFul",
      html
    );
    return res.send({ message: "Your Password is Successfully Updated" });
  } catch (err) {
    res.status(422).send({ error: err });
  }
});

module.exports = router;
