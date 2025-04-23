import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  postId: { type: String, required: true },
  email: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Comment", commentSchema);
