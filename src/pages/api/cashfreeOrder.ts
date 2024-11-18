import { NextApiRequest, NextApiResponse } from "next";

const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { amount, orderId, customerEmail, customerPhone } = req.body;

  try {
    const response = await fetch("https://sandbox.cashfree.com/pg/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": CASHFREE_APP_ID as string,
        "x-client-secret": CASHFREE_SECRET_KEY as string,
      },
      body: JSON.stringify({
        order_id: orderId,
        order_amount: amount,
        order_currency: "INR",
        customer_details: {
          customer_id: orderId,
          customer_email: customerEmail,
          customer_phone: customerPhone,
        },
        order_note: "Payment for session",
        order_meta: {
          return_url: `${req.headers.origin}/payment-success?order_id=${orderId}`,
        },
      }),
    });

    const result = await response.json();

    if (response.ok && result.payment_link) {
      res.status(200).json({ payment_link: result.payment_link });
    } else {
      console.error("Cashfree order creation error:", result);
      res.status(500).json({
        message: "Failed to initialize payment",
        error: result.message || "Unknown error",
      });
    }
  } catch (error) {
    console.error("Cashfree API call failed:", error);
    res.status(500).json({ message: "An error occurred while creating the order", error });
  }
}
