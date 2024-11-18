// pages/payment.tsx
import React from 'react';
import CashfreeButton from '../components/CashfreeButton';

const PaymentPage: React.FC = () => {
  return (
    <div>
      <h1>Make a Payment</h1>
      <CashfreeButton
        amount={100}
        orderId="order_1234"
        customerEmail="customer@example.com"
        customerPhone="1234567890"
      />
    </div>
  );
};

export default PaymentPage;
