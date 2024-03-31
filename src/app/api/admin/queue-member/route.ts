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

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    const data = await req.json();
    const { name, email, phone, user } = data;
    console.log("🚀 ~ POST ~ user:", user)

    if (!name) {
      return Response.json(
        { error: "Please Enter a Valid Name" },
        { status: 400 }
      );
    }

    const isValidEmail = ValidateEmail(email);
    if (!isValidEmail)
      return Response.json(
        { error: "Please Enter a Valid Email" },
        { status: 400 }
      );
    const isValidPhone = ValidateMobile(phone);
    if (!isValidPhone) {
      return Response.json(
        { error: "Please Enter a Valid Phone Number" },
        { status: 400 }
      );
    }

    // Check if queue owner with the same name already exists
    const isExistingMember = await IsExistsOne({
      model: UserModel,
      where: { $or: [{ phone: phone }, { email: email }] },
    });
    if (isExistingMember) {
      return Response.json(
        { error: "Member with the same email or Phone already exists" },
        { status: 400 }
      );
    }

    const addUser = await Insert({
      model: UserModel,
      data: {
        name,
        email,
        phone,
        role: "Customer",
        password: GeneratePassword(8),
      },
    });
    if (!addUser)
      return Response.json(
        { error: "Failed to create User." },
        { status: 400 }
      );
    const newQueueMember = await Insert({
      model: QueueMemberModel,
      data: {
        name,
        email,
        phone,
        user: addUser._id,
        createdBy: user,
      },
    });
    if (!newQueueMember)
      return Response.json(
        { error: "Failed to create Member." },
        { status: 400 }
      );

    return Response.json(
      { data: newQueueMember, message: "Queue Member added successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error adding queue owner:", error);
    return Response.json(
      { error: "Failed to add queue owner" },
      { status: 500 }
    );
  }
}
export async function GET(req: NextRequest, res: NextResponse) {
  try {
    const userID = req.nextUrl.searchParams.get("userID");
    if (!userID) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    const queueMembers = await Find({
      model: QueueMemberModel,
      where: { createdBy: userID },
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
