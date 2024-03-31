import mongoose, { Mongoose } from "mongoose";
const Schema = mongoose.Schema;

const SessionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "users", required: true },
    name: { type: String, trim: true, required: true },
    isArchived: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

const SessionModel =
  mongoose.models.sessions || mongoose.model("sessions", SessionSchema);
export default SessionModel;
