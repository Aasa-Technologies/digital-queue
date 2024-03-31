import mongoose from "mongoose";
const Schema = mongoose.Schema;

const QueueOwnerSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "users", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "users", required: true },
    lot: { type: Schema.Types.ObjectId, ref: "lots" },
    queue: { type: Schema.Types.ObjectId, ref: "queues" },
    name: { type: String, trim: true, required: true },
    email: { type: String, trim: true, unique: true },
    phone: { type: String, trim: true, unique: true },
  },
  { timestamps: true }
);

const QueueOwnerModel =
  mongoose.models.queue_owners || mongoose.model("queue_owners", QueueOwnerSchema);
export default QueueOwnerModel;
