import mongoose from 'mongoose';

const NewsSchema = new mongoose.Schema({
  title: { type: String, unique: true },
  link: String,
  pubDate: String,
  description: String,
  content: String,
  source_id: String,
  image_url: String,
  video_url: String,
  creator: [String],
});

const News = mongoose.model('News', NewsSchema);

export default News;
