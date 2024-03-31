import mongoose from "mongoose";
const Schema = mongoose.Schema;

const QueueMemberSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "users", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "users", required: false },
    name: { type: String, trim: true, required: true },
    email: { type: String, trim: true, unique: true, required: true },
    phone: { type: String, trim: true, unique: true, required: true },
  },
  { timestamps: true }
);

const QueueMemberModel =
  mongoose.models.queue_members ||
  mongoose.model("queue_members", QueueMemberSchema);
export default QueueMemberModel;
