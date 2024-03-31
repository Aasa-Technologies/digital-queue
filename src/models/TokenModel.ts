import mongoose, { Mongoose } from "mongoose";
const Schema = mongoose.Schema;

const TokenSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "queue_members", required: true },
    lot: { type: Schema.Types.ObjectId, ref: "lots", required: true },
    queue: { type: Schema.Types.ObjectId, ref: "queues", required: true },
    session: { type: Schema.Types.ObjectId, ref: "session", required: true },
    owner: { type: Schema.Types.ObjectId, ref: "queue_owners", required: true },
    tokenNo: { type: String, required: true },
    status: {
      type: String,
      required: true,
      trim: true,
      enum: [
        "Completed",
        "NextLot",
        "InsideQueue",
        "Rejected",
        "PermanentLeave",
        "TemporaryLeave",
      ],
    },
  },
  { timestamps: true }
);

const TokenModels =
  mongoose.models.tokens || mongoose.model("tokens", TokenSchema);
export default TokenModels;
