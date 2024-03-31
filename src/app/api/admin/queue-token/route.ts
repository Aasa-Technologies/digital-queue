import QueueMemberModel from "@/models/QueueMemberModel";
import QueueModel from "@/models/QueueModel";
import SessionModel from "@/models/SessionModel";
import TokenModels from "@/models/TokenModel";
import { connect } from "@/utils/connection";
import {
  Aggregate,
  Find,
  FindOne,
  Insert,
  IsExistsOne,
} from "@/utils/mongoose";
import moment from "moment";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

connect();
export async function POST(req: NextRequest, res: NextResponse) {
  const data = await req.json();

  const { user, lot, queue, member } = data;

  const todayStart = moment().startOf("day");
  const todayEnd = moment().endOf("day");
  const isTodaySession = await IsExistsOne({
    model: SessionModel,
    where: {
      user: user,
      createdAt: {
        $gte: todayStart.toDate(),
        $lt: todayEnd.toDate(),
      },
    },
  });
  if (!isTodaySession) {
    return Response.json({ error: "Create A Session First." }, { status: 400 });
  }

  const queueInfo = await FindOne({
    model: QueueModel,
    where: {
      _id: queue,
    },
  });
  const owner = queueInfo.owner;
  if (!owner) {
    return Response.json(
      { error: "This Queue Doesn't Have any Owner." },
      { status: 400 }
    );
  }

  const findMember = await FindOne({
    model: QueueMemberModel,
    where: {
      email: member,
    },
  });

  if (!findMember)
    return Response.json(
      { error: "Member With this email doesn't exist." },
      { status: 400 }
    );

  const currentDate = moment().format("DDMMYYHHmmss");

  const createToken = await Insert({
    model: TokenModels,
    data: {
      user: new mongoose.Types.ObjectId(findMember._id),
      lot: new mongoose.Types.ObjectId(lot),
      queue: new mongoose.Types.ObjectId(queue),
      session: isTodaySession._id,
      owner: new mongoose.Types.ObjectId(owner),
      tokenNo: `DQE${currentDate}`,
      status: "InsideQueue",
    },
  });

  return Response.json(
    { data: createToken, message: "Token Generated!" },
    { status: 200 }
  );
}

export async function GET(req: NextRequest, res: NextResponse) {
  try {
    const userID = req.nextUrl.searchParams.get("userID");

    const todayStart = moment().startOf("day");
    const todayEnd = moment().endOf("day");
    const isTodaySession = await IsExistsOne({
      model: SessionModel,
      where: {
        user: userID,
        createdAt: {
          $gte: todayStart.toDate(),
          $lt: todayEnd.toDate(),
        },
      },
    });
    if (!isTodaySession) {
      return Response.json(
        { error: "No Session Found For Today." },
        { status: 400 }
      );
    }
    const queueToken = await Aggregate({
      model: TokenModels,
      data: [
        {
          $match: {
            session: isTodaySession._id,
          },
        },
        {
          $lookup: {
            from: "queue_members",
            localField: "user",
            foreignField: "_id",
            as: "queue_members",
          },
        },
        {
          $lookup: {
            from: "lots",
            localField: "lot",
            foreignField: "_id",
            as: "lots_info",
          },
        },
        {
          $lookup: {
            from: "queues",
            localField: "queue",
            foreignField: "_id",
            as: "queues",
          },
        },
        {
          $lookup: {
            from: "queue_owners",
            localField: "owner",
            foreignField: "_id",
            as: "queue_owners",
          },
        },
        {
          $unwind: {
            path: "$lots_info",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: "$queue_members",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: "$queue_owners",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: "$queues",
            preserveNullAndEmptyArrays: true,
          },
        },
      ],
    });
    console.log("🚀 ~ GET ~ queueToken:", queueToken);
    return Response.json({ data: queueToken }, { status: 200 });
  } catch (error) {
    console.error("Error fetching queue queueToken:", error);
    return Response.json(
      { error: "Failed to fetch queue queueToken" },
      { status: 500 }
    );
  }
}
