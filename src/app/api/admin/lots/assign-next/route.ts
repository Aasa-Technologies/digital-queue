import LotModel from "@/models/LotModel";
import QueueModel from "@/models/QueueModel";
import TokenModels from "@/models/TokenModel";
import { connect } from "@/utils/connection";
import {
  Find,
  FindAndUpdate,
  FindOne,
  Insert,
  IsExistsOne,
} from "@/utils/mongoose";
import moment from "moment";
import mongoose from "mongoose";
import { NextApiRequest } from "next";
import { NextRequest, NextResponse } from "next/server";

connect();

export async function POST(req: NextRequest, res: NextResponse) {
  const data = await req.json();

  if (!data.id) {
    return Response.json({ error: "ID Not Found." }, { status: 400 });
  }
  if (!data.user) {
    return Response.json({ error: "User Not Found." }, { status: 400 });
  }

  const token = await FindOne({
    model: TokenModels,
    where: {
      _id: new mongoose.Types.ObjectId(data.id),
    },
  });

  if (!token) {
    return Response.json({ error: "Token Not Found." }, { status: 400 });
  }

  const lots = await Find({
    model: LotModel,
    where: {
      user: new mongoose.Types.ObjectId(data.user),
    },
  });

  if (!lots) {
    return Response.json({ error: "Lots Not Found." }, { status: 400 });
  }
  const index = lots.findIndex((lot) => lot._id.toString() == token.lot);
  console.log("🚀 ~ POST ~ lots:", lots);
  console.log("🚀 ~ POST ~ index:", index);

  const newLot = lots[index + 1];
  console.log("🚀 ~ POST ~ newLot:", newLot);
  if (!newLot) {
    return Response.json({ error: "No Next Lot Found." }, { status: 400 });
  }

  const findQueues = await Find({
    model: QueueModel,
    where: {
      lot: newLot._id,
      isDisabled: false,
      owner: { $ne: null },
    },
  });

  if (!findQueues || findQueues?.length === 0) {
    return Response.json(
      { error: "No Queue Found In Next Lot with owner." },
      { status: 400 }
    );
  }
  const Queue = findQueues[0];

  const updatedLot = await FindAndUpdate({
    model: TokenModels,
    where: {
      _id: token._id,
    },
    update: {
      lot: newLot._id,
      queue: Queue._id,
      status:"NextLot"
    },
  });

  return Response.json(
    { data: updatedLot, message: "Assign To Next Lot" },
    { status: 200 }
  );
}
