import Order from "../models/orderschema.js";
import Subscription from "../models/subscreptionschema.js";
import User from "../models/userschema.js";
import crypto from 'crypto';

const createorder = async (req, res) => {
  try {
    const { otherdetails, userdetails, order_cloths, subscriptionRedemption } = req.body;

    const { area, city, houseno, name, phoneno, pincode, streetname } = userdetails;

    const { paymenttype, timeslot, totalamount, totalcloths, deliverySpeed } = otherdetails;

    const user = req.user;

    const checkuser_registered = await User.findById(user?._id);

    if (!checkuser_registered) {
      return res.status(500).json({
        error: "Please signup to book slots",
      });
    }

    let orderid = (await Order.countDocuments({})) + 1;

    // Calculate final amount considering subscription redemption
    let finalAmount = totalamount;
    let redeemedCredits = 0;
    let redeemedItems = [];

    if (subscriptionRedemption) {
      finalAmount = subscriptionRedemption.payableAmount || totalamount;
      redeemedCredits = subscriptionRedemption.usedCredits || 0;
      redeemedItems = subscriptionRedemption.redeemedItems || [];
    }

    // Map payment type to enum values
    const paymentTypeMap = {
      'online payment': 'online',
      'cash': 'cash',
      'card': 'card',
      'upi': 'upi',
      'online': 'online'
    };

    const order = new Order({
      orderid,
      userid: user?._id,
      user_name: name,
      user_phoneno: phoneno,
      user_address: {
        houseno,
        streetname,
        area,
        city,
        pincode,
      },
      order_cloths,
      order_date: new Date().toISOString(),
      order_totalamount: totalamount, // Original amount
      order_finalamount: finalAmount, // Amount after redemption
      order_totalcloths: totalcloths,
      order_slot: timeslot,
      order_paymenttype: paymentTypeMap[paymenttype?.toLowerCase()] || paymenttype || 'online',
      order_deliveryspeed: deliverySpeed || 'normal',
      payment_status: finalAmount === 0 ? 'paid' : 'pending',
      subscription_redemption: {
        used: !!subscriptionRedemption,
        subscriptionId: subscriptionRedemption?.subscriptionId || null,
        redeemedCredits: redeemedCredits,
        redeemedItems: redeemedItems,
        redeemedAt: subscriptionRedemption ? new Date() : null
      }
    });

    await order.save();

    // If subscription was used, update the subscription
    if (subscriptionRedemption && subscriptionRedemption.subscriptionId) {
      try {
        console.log(subscriptionRedemption,'sub')
        await updateSubscriptionAfterOrder(
          subscriptionRedemption.subscriptionId,
          subscriptionRedemption.usedCredits,
          subscriptionRedemption.redeemedItems,
          user?._id
        );
      } catch (subError) {
        console.error('Error updating subscription:', subError);
        // Don't fail the order if subscription update fails
        // Log it for manual intervention
      }
    }

    res.status(200).json({
      data: order,
      message: "Order created successfully",
    });
  } catch (error) {
    console.log(error, 'err');
    res.status(500).json({ error: "Error in creating the Order" });
  }
};

// Helper function to update subscription
const updateSubscriptionAfterOrder = async (subscriptionId,usedCredit, redeemedItems, userId) => {
  const subscription = await Subscription.findById(subscriptionId);

  if (!subscription) {
    throw new Error("Subscription not found");
  }

  console.log(redeemedItems);

  // Calculate total credits used
  let usedCredits = 0;

  redeemedItems.forEach((item) => {
    usedCredits += item.count 
  });

  // Decrease subscription credits
  subscription.credits -= usedCredits;

  // Update cloth counts
  redeemedItems.forEach((item) => {
    const clothIndex = subscription.cloths.findIndex(
      (c) => c.name.toLowerCase() === item.name.toLowerCase()
    );

    if (clothIndex !== -1) {
      subscription.cloths[clothIndex].count -= item.count;
    }
  });

  // Add usage history
  subscription.usageHistory = subscription.usageHistory || [];

  subscription.usageHistory.push({
    date: new Date(),
    usedCredits: usedCredits,
    items: redeemedItems,
    userId: userId,
  });

  console.log(subscription, "updated subscription");

  await subscription.save();
};


const verifyOrderPayment = async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      orderId,
      useSubscription,
      subscriptionId,
      usedCredits,
      redeemedItems
    } = req.body;

    // Verify signature
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid signature'
      });
    }

    // Update order payment status
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.payment_status = 'paid';
    order.payment_details = {
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
      signature: razorpay_signature,
      method: 'razorpay', // This matches the enum value
      paid_at: new Date(),
      amount_paid: Number(order.order_finalamount),
      currency: 'INR'
    };
    await order.save();

    // If subscription was used, update it
    if (useSubscription && subscriptionId && usedCredits > 0) {
      try {
        await updateSubscriptionAfterOrder(
          subscriptionId,
          usedCredits,
          redeemedItems || [],
          order.userid
        );
      } catch (subError) {
        console.error('Error updating subscription:', subError);
        // Log for manual intervention but don't fail the response
      }
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      order: order
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Payment verification failed'
    });
  }
};


const getorder_by_id = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(order_id);

    if (!order) {
      res.status(404).json({
        error: "Given orde Id is not avilable",
      });
    }
    res.status(200).json({
      data: order,
      message: "Order fetched successfully",
    });
  } catch (error) {
    rs.status(500).json({
      error: "Error in fetching the given order",
    });
  }
};

const update_flow_order = async (req, res) => {
  try {
    const { order_id, step } = req.body;

    const order = await Order.findById(order_id);

    if (!order) {
      return res
        .status(404)
        .json({ error: "The given order is expired or not found" });
    }

    if (order.agent_id.toString() !== req.user._id.toString()) {
      return res.status(404).json({
        error: "You are not the assigned agent to update the Order status",
      });
    }

    const flow = order.order_flow.find((f) => f.step === step);

    if (!flow) {
      return res.status(404).json({ error: "Invalid step" });
    }

    flow.completed = true;
    flow.completedAt = new Date();

    await order.save();

    res.status(200).json({
      data: order,
      message: "Order status updted successfully",
    });
  } catch (error) {
    rs.status(500).json({
      error: "Error in fetching the given order",
    });
  }
};

const get_user_orders = async (req, res) => {
  try {
    const order = await Order.find({ userid: req.user._id })
      .sort({ createdAt: -1 })
      .skip(1);

    // console.log(order)

    if (order.length === 0) {
      res.status(404).json({
        error: "No order is created for user",
      });
    }

    res.status(200).json({
      data: order,
      message: "User orders fetched successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: "Error in fetching the given order",
    });
  }
};

const get_user_last_order = async (req, res) => {
  try {
    const last_active_order = await Order.findOne({
      userid: req.user._id,
    }).sort({ createdAt: -1 });

    res.json({
      message: "Your last order fetched successfully",
      data: last_active_order,
    });
  } catch (error) {
    rs.status(500).json({
      error: "Error in fetching the given order",
    });
  }
};

export {
  createorder,
  getorder_by_id,
  update_flow_order,
  get_user_orders,
  get_user_last_order,
  verifyOrderPayment
};
