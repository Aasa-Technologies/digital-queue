import LotModel from "@/models/LotModel";
import TokenModels from "@/models/TokenModel";
import { connect } from "@/utils/connection";
import { Aggregate, Find, Insert, IsExistsOne } from "@/utils/mongoose";
import moment from "moment";
import mongoose from "mongoose";
import { NextApiRequest } from "next";
import { NextRequest, NextResponse } from "next/server";

connect();
export async function GET(req: NextRequest) {
  const user = req.nextUrl.searchParams.get("user");

  if (!user) {
    return Response.json({ error: "lot is required" }, { status: 400 });
  }

  try {
    const lots = await Find({
      model: LotModel,
      where: {
        user: new mongoose.Types.ObjectId(user),
      },
    });
    if (!lots) {
      return Response.json({ error: "No Lots Found" }, { status: 400 });
    }
    const todayStart = moment().startOf("day");
    const todayEnd = moment().endOf("day");
    for (let index = 0; index < lots.length; index++) {
      const element = lots[index];
      const token = await Aggregate({
        model: TokenModels,
        data: [
          {
            $match: {
              lot: new mongoose.Types.ObjectId(element._id),
              createdAt: {
                $gte: todayStart.toDate(),
                $lt: todayEnd.toDate(),
              },
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

      element.token = token || [];
      console.log("🚀 ~ GET ~ token:", token);
    }

    return Response.json({ data: lots }, { status: 200 });
  } catch (error) {
    console.error("Error fetching lots:", error);
    return Response.json({ error: "Failed to fetch lots" }, { status: 500 });
  }
}
