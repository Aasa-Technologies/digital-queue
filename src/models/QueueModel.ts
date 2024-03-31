import mongoose from "mongoose";
const Schema = mongoose.Schema;

const QueueSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "users", required: true },
    lot: { type: Schema.Types.ObjectId, ref: "lots", required: true },
    owner: { type: Schema.Types.ObjectId, ref: "queue_owners" },
    name: { type: String, trim: true, required: true },
    isDisabled: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

const QueueModel =
  mongoose.models.queues || mongoose.model("queues", QueueSchema);
export default QueueModel;
