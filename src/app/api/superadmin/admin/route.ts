import { UserModel } from "@/models";
import { connect } from "@/utils/connection";
import {
  Insert,
  IsExists,
  IsExistsOne,
  PasswordStrength,
  ValidateEmail,
  ValidateMobile,
} from "@/utils/mongoose";
import { NextRequest, NextResponse } from "next/server";

connect();
export async function GET() {
  return Response.json({ data: "Hello" });
}
export async function POST(req: NextRequest, res: NextResponse) {
  const data = await req.json();
  console.log("🚀 ~ POST ~ data:", data);
  const isValidEmail = ValidateEmail(data.email);
  if (!isValidEmail)
    return Response.json(
      { error: "Please Enter a Valid Email" },
      { status: 400 }
    );
  const isValidPhone = ValidateMobile(data.phone);
  const isValidPassword = PasswordStrength(data.password);
  if (!isValidPhone) {
    return Response.json(
      { error: "Please Enter a Valid Phone Number" },
      { status: 400 }
    );
  }

  if (!isValidPassword) {
    return Response.json({ error: "Password must be strong" }, { status: 400 });
  }
  const IsExistsData = await IsExistsOne({
    model: UserModel,
    where: {
      $or: [{ phone: data.phone }, { email: data.email }],
    },
  });
  console.log("🚀 ~ POST ~ IsExistsData:", IsExistsData);
  if (IsExistsData) {
    return Response.json(
      { error: "User With Same Email OR Phone Exist." },
      { status: 400 }
    );
  }
  const addNewAdmin = await Insert({
    model: UserModel,
    data: data,
  });
  if (!addNewAdmin)
    return Response.json({ error: "Failed to Add" }, { status: 400 });
  return Response.json(
    { data: addNewAdmin, message: "Admin Added Successfully" },
    { status: 200 }
  );
}
