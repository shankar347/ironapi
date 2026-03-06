// controllers/payment.controller.js
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Subscription from '../models/subscreptionschema.js';
    

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});   

export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount, currency, receipt, notes } = req.body;

    const options = {
      amount: amount * 100, // Convert to paise
      currency: currency || 'INR',
      receipt: receipt,
      notes: notes
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt
      }
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order'
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      subscriptionId
    } = req.body;

    // First, get the subscription to access its plan
    const existingSubscription = await Subscription.findById(subscriptionId);
    
    if (!existingSubscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found"
      });
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      // Update payment status to failed
      await Subscription.findByIdAndUpdate(subscriptionId, {
        paymentStatus: "failed",
        paymentDetails: {
          razorpay_payment_id,
          razorpay_order_id,
          razorpay_signature,
          failedAt: new Date()
        }
      });

      return res.status(400).json({
        success: false,
        message: "Invalid signature"
      });
    }

    // Prepare update data
    const updateData = {
      paymentStatus: "paid",
      status: "active",
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      paymentDetails: {
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
        paidAt: new Date()
      }
    };

    // Set enddate based on plan if needed
    if (existingSubscription.plan === "Popular plan") {
      updateData.enddate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    }

    // Update subscription with payment details
    const updatedSubscription = await Subscription.findByIdAndUpdate(
      subscriptionId,
      updateData,
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      subscription: updatedSubscription
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed'
    });
  }
};      