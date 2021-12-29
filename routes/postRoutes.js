const express = require("express");
const checkedLoginStatus = require("../middlewares/checkedLoginStatus");
const router = express.Router();
const Post = require("../models/PostModel");

router.post("/createPost", checkedLoginStatus, async (req, res) => {
  const { caption, url } = req.body;
  if (!url) {
    return res.status(422).json({ error: "Please upload an image" });
  }
  try {
    const post = new Post({
      caption,
      photo: url,
      postedBy: req.user,
    });
    const result = await post.save();
    res.status(200).json({ message: "successfully posted", result });
  } catch (err) {
    return res.status(422).json({ error: "error" });
  }
});

router.get("/allPosts", checkedLoginStatus, async (req, res) => {
  try {
    let posts = await Post.find()
      .populate("postedBy", "_id username profilePic")
      .populate("comments.postedBy", "_id username")
      .sort("-createdAt");
    return res.status(200).json(posts);
  } catch (err) {
    return res.status(400).json({ error: "error" });
  }
});

router.get("/friendPosts", checkedLoginStatus, async (req, res) => {
  try {
    let posts = await Post.find({
      $or: [
        { postedBy: { $in: req.user.following } },
        { postedBy: { _id: req.user._id } },
      ],
    })
      .populate("postedBy", "_id username profilePic")
      .populate("comments.postedBy", "_id username")
      .sort("-createdAt");
    return res.status(200).json(posts);
  } catch (err) {
    return res.status(400).json({ error: "error" });
  }
});

router.get("/myPosts", checkedLoginStatus, async (req, res) => {
  try {
    let posts = await Post.find({ postedBy: req.user._id })
      .populate("postedBy", "_id username profilePic")
      .sort("-createdAt");

    return res.status(200).json(posts);
  } catch (err) {
    return res.status(400).json({ error: "error" });
  }
});

router.put("/like", checkedLoginStatus, (req, res) => {
  Post.findByIdAndUpdate(
    req.body.postId,
    {
      $push: { likes: req.user._id },
    },
    {
      new: true,
    }
  )
    .populate("postedBy", "_id username profilePic")
    .populate("comments.postedBy", "_id username")
    .exec((error, result) => {
      if (error) {
        return res.status(422).json(error);
      }
      return res.json(result);
    });
});

router.put("/unlike", checkedLoginStatus, (req, res) => {
  Post.findByIdAndUpdate(
    req.body.postId,
    {
      $pull: { likes: req.user._id },
    },
    {
      new: true,
    }
  )
    .populate("postedBy", "_id username profilePic")
    .populate("comments.postedBy", "_id username")
    .exec((error, result) => {
      if (error) {
        return res.status(422).json(error);
      }
      return res.json(result);
    });
});

router.put("/comment", checkedLoginStatus, (req, res) => {
  const comment = {
    text: req.body.text,
    postedBy: req.user,
  };
  Post.findByIdAndUpdate(
    req.body.postId,
    {
      $push: { comments: comment },
    },
    {
      new: true,
    }
  )
    .populate("comments.postedBy", "_id username")
    .populate("postedBy", "_id username profilePic")
    .exec((error, result) => {
      if (error) {
        return res.status(422).json(error);
      }
      return res.json(result);
    });
});

router.put("/deleteComment", checkedLoginStatus, (req, res) => {
  const comment = {
    text: req.body.text,
    postedBy: req.user,
  };

  Post.findByIdAndUpdate(
    req.body.postId,
    {
      $pull: { comments: comment },
    },
    {
      new: true,
    }
  )
    .populate("postedBy", "_id username profilePic")
    .populate("comments.postedBy", "_id username")
    .exec((error, result) => {
      if (error) {
        return res.status(422).json(error);
      }
      return res.json(result);
    });
});

router.delete("/deletePost/:postId", checkedLoginStatus, async (req, res) => {
  let postId = req.params.postId;
  let post = await Post.findOne({ _id: postId });

  if (post.postedBy._id.toString() !== req.user._id.toString()) {
    return res
      .status(401)
      .json({ error: "You don't have access to this action" });
  }
  Post.findOneAndDelete({ _id: req.params.postId })
    .populate("postedBy", "_id")
    .exec((error, result) => {
      if (error) {
        return res.status(422).json({ error: "Please try again" });
      }
      return res.json(result);
    });
});

module.exports = router;
