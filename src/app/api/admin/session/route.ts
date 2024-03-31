import { UserModel, mongoose } from "@/models";
import SessionModel from "@/models/SessionModel";
import TokenModels from "@/models/TokenModel";
import { connect } from "@/utils/connection";
import {
  Aggregate,
  Insert,
  IsExists,
  IsExistsOne,
  PasswordStrength,
  ValidateEmail,
  ValidateMobile,
} from "@/utils/mongoose";
import moment from "moment";
import { NextRequest, NextResponse } from "next/server";

connect();
export async function GET(req: NextRequest, res: NextResponse) {
  const user = req.nextUrl.searchParams.get("user");
  if (!user) {
    return Response.json({
      status: 400,
      message: "User Not Found",
    });
  }
  // const sessionWiseTokenData = await Aggregate({
  //   model: SessionModel,
  //   data: [
  //     {
  //       $match: {
  //         user: new mongoose.Types.ObjectId(user),
  //       },
  //     },
  //     {
  //       $lookup: {
  //         from: "tokens",
  //         localField: "_id",
  //         foreignField: "session",
  //         as: "tokens",
  //       },
  //     },
  //     {
  //       $lookup: {
  //         from: "queue_owners",
  //         localField: "tokens.owner",
  //         foreignField: "_id",
  //         as: "ownerData",
  //       },
  //     },
  //     {
  //       $lookup: {
  //         from: "queue_members",
  //         localField: "tokens.user",
  //         foreignField: "_id",
  //         as: "memberData",
  //       },
  //     },
  //     {
  //       $lookup: {
  //         from: "queues",
  //         localField: "tokens.queue",
  //         foreignField: "_id",
  //         as: "queueData",
  //       },
  //     },
  //     {
  //       $lookup: {
  //         from: "lots",
  //         localField: "tokens.lot",
  //         foreignField: "_id",
  //         as: "lotData",
  //       },
  //     },
  //     {
  //       $project: {
  //         user: 1,
  //         name: 1,
  //         isArchived: 1,
  //         tokens: {
  //           $map: {
  //             input: "$tokens",
  //             as: "token",
  //             in: {
  //               tokenNo: "$$token.tokenNo",
  //               status: "$$token.status",
  //               ownerData: {
  //                 $arrayElemAt: ["$ownerData", 0],
  //               },
  //               queueData: {
  //                 $arrayElemAt: ["$queueData", 0],
  //               },
  //               lotData: {
  //                 $arrayElemAt: ["$lotData", 0],
  //               },
  //               memberData: {
  //                 $arrayElemAt: ["$memberData", 0],
  //               },
  //             },
  //           },
  //         },
  //       },
  //     },
  //   ],
  // });
  const sessionWiseTokenData = await Aggregate({
    model: SessionModel,
    data: [
      {
        $match: {
          user: new mongoose.Types.ObjectId(user),
        },
      },
      {
        $lookup: {
          from: "tokens",
          localField: "_id",
          foreignField: "session",
          as: "tokens",
        },
      },
      {
        $lookup: {
          from: "queue_owners",
          localField: "tokens.owner",
          foreignField: "_id",
          as: "ownerData",
        },
      },
      {
        $lookup: {
          from: "queue_members",
          localField: "tokens.user",
          foreignField: "_id",
          as: "memberData",
        },
      },
      {
        $lookup: {
          from: "queues",
          localField: "tokens.queue",
          foreignField: "_id",
          as: "queueData",
        },
      },
      {
        $lookup: {
          from: "lots",
          localField: "tokens.lot",
          foreignField: "_id",
          as: "lotData",
        },
      },
      {
        $project: {
          user: 1,
          name: 1,
          isArchived: 1,
          tokens: {
            $map: {
              input: "$tokens",
              as: "token",
              in: {
                tokenNo: "$$token.tokenNo",
                status: "$$token.status",
                ownerData: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$ownerData",
                        as: "owner",
                        cond: {
                          $eq: ["$$owner._id", "$$token.owner"],
                        },
                      },
                    },
                    0,
                  ],
                },
                queueData: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$queueData",
                        as: "queue",
                        cond: {
                          $eq: ["$$queue._id", "$$token.queue"],
                        },
                      },
                    },
                    0,
                  ],
                },
                lotData: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$lotData",
                        as: "lot",
                        cond: {
                          $eq: ["$$lot._id", "$$token.lot"],
                        },
                      },
                    },
                    0,
                  ],
                },
                memberData: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$memberData",
                        as: "member",
                        cond: {
                          $eq: ["$$member._id", "$$token.user"],
                        },
                      },
                    },
                    0,
                  ],
                },
              },
            },
          },
        },
      },
    ],
  });
  
  return Response.json({ data: sessionWiseTokenData });
}
export async function POST(req: NextRequest, res: NextResponse) {
  const data = await req.json();
  if (!data.name) {
    return Response.json(
      { error: "Please Enter a Session Name" },
      { status: 400 }
    );
  }
  const todayStart = moment().startOf("day");
  const todayEnd = moment().endOf("day");
  const isTodaySessionExist = await IsExistsOne({
    model: SessionModel,
    where: {
      user: data.user,
      createdAt: {
        $gte: todayStart.toDate(),
        $lt: todayEnd.toDate(),
      },
    },
  });

  if (isTodaySessionExist) {
    return Response.json(
      { error: "Session Already Exist For Today." },
      { status: 400 }
    );
  }
  const insertSession = await Insert({
    model: SessionModel,
    data: {
      name: data.name,
      user: data.user,
    },
  });
  if (!insertSession) {
    return Response.json(
      { error: "Failed To Create Session." },
      { status: 400 }
    );
  }
  return Response.json(
    { data: insertSession, message: "Session Added Successfully" },
    { status: 200 }
  );
}
