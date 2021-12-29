const express = require("express");
const checkedLoginStatus = require("../middlewares/checkedLoginStatus");
const router = express.Router();
const Post = require("../models/PostModel");
const User = require("../models/UserModel");
const removeFields = "-password -resetPasswordExpiresIn -resetPasswordToken";

router.get("/user/:id", checkedLoginStatus, async (req, res) => {
  try {
    let user = await User.find({ _id: req.params.id }).select(removeFields);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    let posts = await Post.find({ postedBy: req.params.id }).populate(
      "postedBy",
      "_id username"
    );

    return res.json({ user, posts });
  } catch (err) {
    res.status(422).json({ error: err });
  }
});

router.put("/follow", checkedLoginStatus, async (req, res) => {
  try {
    await User.findByIdAndUpdate(
      { _id: req.body.followId },
      { $push: { followers: req.user._id } },
      { new: true }
    );

    let user = await User.findByIdAndUpdate(
      { _id: req.user._id },
      { $push: { following: req.body.followId } },
      { new: true }
    ).select(removeFields);

    return res.json(user);
  } catch (err) {
    res.status(422).json({ error: err });
  }
});

router.put("/unfollow", checkedLoginStatus, async (req, res) => {
  try {
    await User.findByIdAndUpdate(
      { _id: req.body.unfollowId },
      { $pull: { followers: req.user._id } },
      { new: true }
    );

    let user = await User.findByIdAndUpdate(
      { _id: req.user._id },
      { $pull: { following: req.body.unfollowId } },
      { new: true }
    ).select(removeFields);

    return res.json(user);
  } catch (err) {
    res.status(422).json({ error: err });
  }
});

router.put("/updateProfilePic", checkedLoginStatus, async (req, res) => {
  try {
    if (req.body.profilePic === "") {
      res.status(422).json("Please upload a Picture");
    }
    let user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { profilePic: req.body.profilePic } },
      { new: true }
    );

    res.json({ user, message: "Profile Pic Updated!" });
  } catch (err) {
    res.status(422).json(err);
  }
});

router.post("/searchUser", async (req, res) => {
  try {
    const { search } = req.body;
    if (search === "") {
      return res.send({ users: [] });
    }
    let userPattern = new RegExp("^" + search);

    let users = await User.find({
      username: { $regex: userPattern, $options: "i" },
    }).select("_id username");
    res.send({ users });
  } catch (err) {
    res.status(422).send({ error: err });
  }
});

module.exports = router;
