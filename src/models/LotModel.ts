import mongoose, { Mongoose } from "mongoose";
const Schema = mongoose.Schema;

const LotsSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "users", required: true },
    name: { type: String, trim: true, required: true },
    isDisabled: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

const LotModel =
  mongoose.models.lots || mongoose.model("lots", LotsSchema);
export default LotModel;
