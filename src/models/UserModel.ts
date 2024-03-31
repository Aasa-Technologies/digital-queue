import mongoose from "mongoose";
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, trim: true, unique: true },
    phone: { type: String, trim: true, unique: true },
    password: { type: String, required: true, trim: true },
    role: {
      type: String,
      required: true,
      trim: true,
      enum: ["SuperAdmin", "Admin", "Customer", "Employee"],
    },
    active_session_refresh_token: { type: String },
    access_token: { type: String },
  },
  { timestamps: true }
);

const UserModel = mongoose.models.users ||  mongoose.model("users", UserSchema);
export default UserModel;
