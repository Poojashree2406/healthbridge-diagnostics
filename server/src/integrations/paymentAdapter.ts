export class PaymentAdapter {
  static async processPayment(params: {
    bookingId: string;
    amount: number;
    paymentMethod: string;
  }) {
    // Simulate gateway delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const invoiceNumber = `INV-HB-2026-${Math.floor(100000 + Math.random() * 900000)}`;

    return {
      success: true,
      transactionId,
      invoiceNumber,
      status: 'PAID',
      gateway: 'MOCK_RAZORPAY',
      timestamp: new Date().toISOString()
    };
  }

  static async processRefund(params: {
    paymentId: string;
    amount: number;
    reason: string;
  }) {
    await new Promise(resolve => setTimeout(resolve, 200));

    return {
      success: true,
      refundId: `rfnd_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      status: 'PROCESSED',
      timestamp: new Date().toISOString()
    };
  }
}
