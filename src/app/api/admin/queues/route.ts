import LotModel from "@/models/LotModel";
import QueueModel from "@/models/QueueModel";
import {
  Aggregate,
  Find,
  FindAndUpdate,
  Insert,
  IsExists,
  IsExistsOne,
} from "@/utils/mongoose";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
  const data = await req.json();

  if (!data.name || !data.user || !data.lot) {
    return Response.json(
      { error: "Please Enter a Queue Name, User ID, and Lot ID" },
      { status: 400 }
    );
  }

  const isLotDisabled = await IsExistsOne({
    model: LotModel,
    where: { _id: data.lot },
  });
  if (isLotDisabled.isDisabled) {
    return Response.json({ error: "This Lot is disabled." }, { status: 400 });
  }

  const isQueueExists = await IsExistsOne({
    model: QueueModel,
    where: { name: data.name, user: data.user, lot: data.lot },
  });

  if (isQueueExists) {
    return Response.json(
      { error: "Queue with the same name already exists" },
      { status: 400 }
    );
  }

  const insertQueue = await Insert({
    model: QueueModel,
    data: {
      name: data.name,
      user: data.user,
      lot: data.lot,
    },
  });

  if (!insertQueue) {
    return Response.json({ error: "Failed To Create Queue." }, { status: 400 });
  }

  return Response.json(
    { data: insertQueue, message: "Queue Added Successfully" },
    { status: 200 }
  );
}
export async function GET(req: NextRequest, res: NextResponse) {
  const lotId = req.nextUrl.searchParams.get("lotId");
  const userId = req.nextUrl.searchParams.get("userId");

  if (!lotId || !userId) {
    return Response.json(
      { error: "Please provide a lot ID and user ID" },
      { status: 400 }
    );
  }

  const queues = await Aggregate({
    model: QueueModel,
    data: [
      [
        {
          $match: {
            lot: new mongoose.Types.ObjectId(lotId),
            user: new mongoose.Types.ObjectId(userId),
          },
        },
        {
          $lookup: {
            from: "queue_owners",
            localField: "owner",
            foreignField: "_id",
            as: "owner_details",
          },
        },
        {
          $unwind: {
            path: "$owner_details",
            preserveNullAndEmptyArrays: true,
          },
        },
      ],
    ],
  });

  return Response.json({ data: queues }, { status: 200 });
}
export async function PATCH(req: NextRequest, res: NextResponse) {
  const { queueId, name, lotId } = await req.json();
  console.log("🚀 ~ PATCH ~ queueId, name, lotId :", queueId, name, lotId);

  if (!queueId || !name) {
    return Response.json(
      { error: "Please provide a Queue name" },
      { status: 400 }
    );
  }
  const isQueueExists = await IsExistsOne({
    model: QueueModel,
    where: { lot: lotId, name: name },
  });

  console.log("🚀 ~ PATCH ~ isQueueExists:", isQueueExists);
  if (isQueueExists) {
    return Response.json(
      { error: "Queue Name Already Exists" },
      { status: 400 }
    );
  }

  const updatedQueue = await FindAndUpdate({
    model: QueueModel,
    where: { _id: queueId },
    update: { name: name },
  });

  if (!updatedQueue) {
    return Response.json(
      { error: "Failed to update Queue name" },
      { status: 400 }
    );
  }

  return Response.json(
    { data: updatedQueue, message: "Queue name updated successfully" },
    { status: 200 }
  );
}
