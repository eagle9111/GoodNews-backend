import mongoose from "mongoose";

const likeSchema = new mongoose.Schema({
  postId: { type: String, required: true },
  email: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Like", likeSchema);
