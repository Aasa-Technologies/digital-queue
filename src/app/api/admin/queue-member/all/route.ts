import { UserModel } from "@/models";
import QueueMemberModel from "@/models/QueueMemberModel";
import QueueModel from "@/models/QueueModel";
import QueueOwnerModel from "@/models/QueueOwnerModel";
import { connect } from "@/utils/connection";
import {
  Find,
  FindAndUpdate,
  GeneratePassword,
  Insert,
  IsExistsOne,
  ValidateEmail,
  ValidateMobile,
} from "@/utils/mongoose";
import { NextRequest, NextResponse } from "next/server";

connect();

export async function GET(req: NextRequest, res: NextResponse) {
  try {
    const queueMembers = await Find({
      model: QueueMemberModel,
      where: {},
    });

    return Response.json({ data: queueMembers }, { status: 200 });
  } catch (error) {
    console.error("Error fetching queue members:", error);
    return Response.json(
      { error: "Failed to fetch queue members" },
      { status: 500 }
    );
  }
}
