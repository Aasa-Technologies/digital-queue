import { UserModel, mongoose } from "@/models";
import SessionModel from "@/models/SessionModel";
import TokenModels from "@/models/TokenModel";
import { connect } from "@/utils/connection";
import {
  Aggregate,
  FindOne,
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

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    const data = await req.json();
    if (!data.email) {
      return Response.json({ error: "Please Enter a email" }, { status: 400 });
    }
    if (!data.password) {
      return Response.json(
        { error: "Please Enter  password" },
        { status: 400 }
      );
    }

    const findUser = await FindOne({
      model: UserModel,
      where: {
        email: data.email,
        password: data.password,
      },
    });
    if (!findUser) {
      return Response.json(
        { error: "Email or Password is Incorrect." },
        { status: 400 }
      );
    }

    const response = NextResponse.json({
      message: "Login Success",
      data: findUser,
    });

    response.cookies.set("user", findUser?._id, {
      httpOnly: true,
      secure: true,
      sameSite: true,
    });

    response.cookies.set(
      "user-permissions",
      encodeURI(findUser?.role?.toString()),
      {
        httpOnly: true,
        secure: true,
        sameSite: true,
      }
    );

    return response;
  } catch (error) {
    console.log("🚀 ~ POST ~ error:", error);
    return Response.json({ error: "Something went Wrong !" }, { status: 500 });
  }
}
