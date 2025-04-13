import mongoose from 'mongoose';

const revokedTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  createdAt: {
    type: Date,
    expires: 3600, // 1 сағаттан кейін автоматты түрде өшіріледі
    default: Date.now,
  },
});

export default mongoose.model('RevokedToken', revokedTokenSchema);
