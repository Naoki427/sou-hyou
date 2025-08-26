import mongoose from "mongoose"

const { Schema, model, models } = mongoose

const userSchema = new Schema({
  uid: { type: String, required: true, unique: true, index: true },
  email: { type: String, index: true },
  name: { type: String },
  photoURL: { type: String }
}, { timestamps: true });

export default models.User || model("User", userSchema);
