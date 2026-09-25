import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Payment } from '../models/Payment';
import { Booking } from '../models/Booking';
import { Invoice } from '../models/Invoice';
import { createPaymentSchema, PaymentStatus } from '@healthbridge/shared';
import { PaymentAdapter } from '../integrations/paymentAdapter';
import { NotificationAdapter } from '../integrations/notificationAdapter';

export const createPayment = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const validated = createPaymentSchema.parse(req.body);
    const booking = await Booking.findById(validated.bookingId).populate('testIds');

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // Process via mock payment gateway
    const paymentResult = await PaymentAdapter.processPayment({
      bookingId: booking.bookingId,
      amount: validated.amount,
      paymentMethod: validated.paymentMethod
    });

    const paymentIdStr = `PAY-${Date.now()}`;

    const payment = await Payment.create({
      paymentId: paymentIdStr,
      bookingId: booking._id,
      patientId: req.user.id,
      amount: validated.amount,
      paymentMethod: validated.paymentMethod,
      gateway: paymentResult.gateway,
      transactionId: paymentResult.transactionId,
      status: PaymentStatus.PAID,
      invoiceNumber: paymentResult.invoiceNumber
    });

    // Update booking status
    booking.paymentStatus = PaymentStatus.PAID;
    await booking.save();

    // Create Invoice
    const lineItems = (booking.testIds as any[]).map(t => ({
      description: t.name || 'Diagnostic Test',
      amount: t.price || 500
    }));

    if (booking.collectionFee > 0) {
      lineItems.push({ description: 'Home Collection Fee', amount: booking.collectionFee });
    }

    const invoice = await Invoice.create({
      invoiceNumber: paymentResult.invoiceNumber,
      bookingId: booking._id,
      patientId: req.user.id,
      lineItems,
      subtotal: booking.subtotalAmount,
      discount: booking.discountAmount,
      tax: Math.round(booking.payableAmount * 0.05), // 5% GST
      total: booking.payableAmount,
      status: 'PAID'
    });

    // Send notification
    await NotificationAdapter.sendNotification({
      userId: req.user.id,
      title: 'Payment Successful',
      message: `Payment of ₹${validated.amount} for booking ${booking.bookingId} was successful. Invoice: ${paymentResult.invoiceNumber}`,
      type: 'PAYMENT'
    });

    return res.status(201).json({
      success: true,
      payment,
      invoice
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const getPayments = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    let query: any = {};
    if (req.user.role === 'PATIENT') {
      query.patientId = req.user.id;
    }

    const payments = await Payment.find(query)
      .populate('bookingId')
      .sort({ createdAt: -1 });

    return res.json({ success: true, count: payments.length, payments });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const handlePaymentWebhook = async (req: AuthRequest, res: Response) => {
  try {
    const { event, data } = req.body;
    console.log(`[Payment Webhook Received] Event: ${event}`, data);
    return res.json({ received: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
