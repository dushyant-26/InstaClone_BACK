const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const postSchema = new mongoose.Schema(
  {
    caption: {
      type: String,
    },
    photo: {
      type: String,
    },
    likes: [{ type: ObjectId, ref: "Users" }],
    comments: [{ text: String, postedBy: { type: ObjectId, ref: "Users" } }],
    postedBy: {
      type: ObjectId,
      ref: "Users",
    },
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);
module.exports = Post;
