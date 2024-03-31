import LotModel from "@/models/LotModel";
import { connect } from "@/utils/connection";
import { Find, Insert, IsExistsOne } from "@/utils/mongoose";
import moment from "moment";
import { NextApiRequest } from "next";
import { NextRequest, NextResponse } from "next/server";

connect();
export async function GET(req: NextRequest) {
  const user = req.nextUrl.searchParams.get("user");

  if (!user) {
    return Response.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const lots = await Find({
      model: LotModel,
      where: {
        user,
      },
    });

    return Response.json({ data: lots }, { status: 200 });
  } catch (error) {
    console.error("Error fetching lots:", error);
    return Response.json({ error: "Failed to fetch lots" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, res: NextResponse) {
  const data = await req.json();

  if (!data.name) {
    return Response.json({ error: "Please Enter a Lot Name" }, { status: 400 });
  }

  const isLotExist = await IsExistsOne({
    model: LotModel,
    where: {
      name: data.name,
      user: data.user,
    },
  });

  if (isLotExist) {
    return Response.json(
      { error: "Lot Already Exists With This Name." },
      { status: 400 }
    );
  }

  const insertLot = await Insert({
    model: LotModel,
    data: {
      name: data.name,
      user: data.user,
      isDisabled: false,
    },
  });

  if (!insertLot) {
    return Response.json({ error: "Failed To Create Lot." }, { status: 400 });
  }

  return Response.json(
    { data: insertLot, message: "Lot Added Successfully" },
    { status: 200 }
  );
}
