// components/CashfreeButton.tsx
import React, { useState } from 'react';

interface CashfreeButtonProps {
  amount: number;
  orderId: string;
  customerEmail: string;
  customerPhone: string;
}

const CashfreeButton: React.FC<CashfreeButtonProps> = ({
  amount,
  orderId,
  customerEmail,
  customerPhone
}) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/createOrder', {
        // const response = await fetch('/api/cashfreeOrder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // body: JSON.stringify({ amount, orderId, customerEmail, customerPhone }),
        body:JSON.stringify({
            orderId:"100",
            orderAmount: 100, // Replace with dynamic amount
            customerName: 'John Doe',
            customerEmail: 'john@example.com',
            customerPhone: '9876543210',
        })
      });

      const data = await response.json();

      if (data && data.payment_link) {
        window.location.href = data.payment_link;
      } else {
        alert('Payment initialization failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('An error occurred during payment initialization');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handlePayment} disabled={loading}>
      {loading ? 'Processing...' : 'Pay Now'}
    </button>
  );
};

export default CashfreeButton;
