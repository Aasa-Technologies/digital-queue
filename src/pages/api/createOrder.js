import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { orderId, orderAmount, customerName, customerEmail, customerPhone } =
    req.body;

  try {
    const response = await axios.post(
      `http://localhost:3000/admin/session/orders`,
      {
        order_id: "23",
        order_amount: orderAmount,
        order_currency: "INR",
        customer_details: {
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
        },
        order_meta: {
          return_url: `http://localhost:3000/admin/session?order_id={order_id}`,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-client-id": process.env.CASHFREE_APP_ID,
          "x-client-secret": process.env.CASHFREE_SECRET_KEY,
        },
      }
    );
    return res.status(200).json(response.data);
  } catch (error) {
    console.error(
      "Error creating Cashfree order:",
      error.response?.data || error.message
    );
    return res
      .status(500)
      .json({ message: "Failed to create payment order", error: error });
  }
}
