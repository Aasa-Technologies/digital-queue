import { UserModel } from "@/models";
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
    const { name, email, phone, lot, queue, user } = data;
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
    const isExistingOwner = await IsExistsOne({
      model: UserModel,
      where: { $or: [{ phone: phone }, { email: email }] },
    });
    if (isExistingOwner) {
      return Response.json(
        { error: "Queue owner with the same email or Phone already exists" },
        { status: 400 }
      );
    }

    const addUser = await Insert({
      model: UserModel,
      data: {
        name,
        email,
        phone,
        role: "Employee",
        password: GeneratePassword(8),
      },
    });
    if (!addUser)
      return Response.json(
        { error: "Failed to create User." },
        { status: 400 }
      );
    const newQueueOwner = await Insert({
      model: QueueOwnerModel,
      data: {
        name,
        email,
        queue,
        phone,
        lot,
        createdBy: user,
        user: addUser._id,
      },
    });
    if (!newQueueOwner)
      return Response.json(
        { error: "Failed to create Owner." },
        { status: 400 }
      );
    const updateQueue = await FindAndUpdate({
      model: QueueModel,
      where: { _id: queue },
      update: {
        owner: newQueueOwner._id,
      },
    });

    if (!updateQueue)
      return Response.json(
        { error: "Failed to Assign Owner to Queue." },
        { status: 400 }
      );

    return Response.json(
      { data: newQueueOwner, message: "Queue owner added successfully" },
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

    const queueOwners = await Find({
      model: QueueOwnerModel,
      where: { createdBy: userID },
      populate: "queue",
    });

    return Response.json({ data: queueOwners }, { status: 200 });
  } catch (error) {
    console.error("Error fetching queue owners:", error);
    return Response.json(
      { error: "Failed to fetch queue owners" },
      { status: 500 }
    );
  }
}
