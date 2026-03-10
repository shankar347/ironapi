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
   let usedCredits = 0;

    if (subscriptionRedemption) {
      finalAmount = subscriptionRedemption.payableAmount || totalamount;
      redeemedItems = subscriptionRedemption.redeemedItems || [];

    subscriptionRedemption.redeemedItems.forEach((item) => {
    usedCredits += item.count 
  });

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
        redeemedCredits: usedCredits,
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
        console.error('Error updatin  g subscription:', subError);
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

// Get user's last order
const get_user_last_order = async (req, res) => {
  try {
    const lastOrder = await Order.findOne({ userid: req.user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: 'subscription_redemption.subscriptionId',
        select: 'plan credits cloths'
      });

    if (!lastOrder) {
      return res.status(404).json({
        error: "No orders found for user"
      });
    }

    res.status(200).json({
      data: lastOrder,
      message: "Last order fetched successfully"
    });
  } catch (error) {
    console.error('Error fetching last order:', error);
    res.status(500).json({
      error: "Error in fetching the last order"
    });
  }
};

// Get order by ID
const get_order_by_id = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findById(id)
      .populate({
        path: 'subscription_redemption.subscriptionId',
        select: 'plan credits cloths'
      });

    if (!order) {
      return res.status(404).json({
        error: "Given order ID is not available"
      });
    }

    // Verify the order belongs to the requesting user
    if (order.userid.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: "You don't have permission to view this order"
      });
    }

    res.status(200).json({
      data: order,
      message: "Order fetched successfully"
    });
  } catch (error) {
    console.error('Error fetching order by ID:', error);
    res.status(500).json({
      error: "Error in fetching the given order"
    });
  }
};

// Get user orders (excluding the latest one)
const get_user_orders = async (req, res) => {
  try {
    const orders = await Order.find({ userid: req.user._id })
      .sort({ createdAt: -1 })
      .skip(1) // Skip the latest order
      .populate({
        path: 'subscription_redemption.subscriptionId',
        select: 'plan credits'
      });

    res.status(200).json({
      data: orders,
      message: "User orders fetched successfully",
      count: orders.length
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({
      error: "Error in fetching user orders"
    });
  }
};

// Get detailed invoice information for an order
const get_order_invoice_details = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId)
      .populate({
        path: 'subscription_redemption.subscriptionId',
        select: 'plan credits cloths'
      });

    if (!order) {
      return res.status(404).json({
        error: "Order not found"
      });
    }

    // Verify the order belongs to the requesting user
    if (order.userid.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: "You don't have permission to view this order"
      });
    }

    // Format order cloths for better readability in invoice
    const formattedItems = order.order_cloths.map(cloth => ({
      name: cloth.item,
      quantity: parseInt(cloth.quantity) || 0,
      cost: parseFloat(cloth.cost) || 0,
      total: (parseInt(cloth.quantity) || 0) * (parseFloat(cloth.cost) || 0)
    }));

    // Calculate totals
    const subtotal = formattedItems.reduce((sum, item) => sum + item.total, 0);
    const totalAmount = parseFloat(order.order_totalamount) || 0;
    const finalAmount = parseFloat(order.order_finalamount) || totalAmount;
    const discountAmount = totalAmount - finalAmount;

    // Format redeemed items if any
    const redeemedItems = order.subscription_redemption?.redeemedItems?.map(item => ({
      name: item.name,
      count: item.count,
      cost: item.cost || 0,
      total: (item.count || 0) * (item.cost || 0)
    })) || [];

    // Prepare complete invoice details
    const invoiceDetails = {
      // Order Information
      orderId: order._id,
      orderNumber: order.orderid,
      orderDate: order.order_date,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,

      // Customer Information
      customer: {
        name: order.user_name,
        phone: order.user_phoneno,
        address: {
          houseno: order.user_address?.houseno || '',
          streetname: order.user_address?.streetname || '',
          area: order.user_address?.area || '',
          city: order.user_address?.city || '',
          pincode: order.user_address?.pincode || ''
        }
      },

      // Order Items
      items: formattedItems,
      totalItems: parseInt(order.order_totalcloths) || 0,

      // Pricing Details
      pricing: {
        subtotal: subtotal,
        totalAmount: totalAmount,
        finalAmount: finalAmount,
        discountAmount: discountAmount,
        currency: 'INR'
      },

      // Service Details
      service: {
        timeSlot: order.order_slot,
        deliverySpeed: order.order_deliveryspeed,
        paymentType: order.order_paymenttype
      },

      // Payment Information
      payment: {
        status: order.payment_status,
        details: order.payment_details || {},
        method: order.order_paymenttype
      },

      // Subscription Redemption (if applicable)
      subscriptionRedemption: order.subscription_redemption?.used ? {
        used: true,
        subscriptionId: order.subscription_redemption.subscriptionId,
        redeemedCredits: order.subscription_redemption.redeemedCredits || 0,
        redeemedItems: redeemedItems,
        redeemedAt: order.subscription_redemption.redeemedAt
      } : {
        used: false
      },

      // Order Status Timeline
      orderFlow: order.order_flow || [],

      // Additional Information
      agent: order.agent_id ? {
        agentId: order.agent_id,
        name: order.agent_name,
        phone: order.agent_phoneno
      } : null,

      notes: order.notes,
      
      // Cancellation Status
      cancellation: order.cancelled_at ? {
        cancelled: true,
        reason: order.cancellation_reason,
        cancelledAt: order.cancelled_at
      } : {
        cancelled: false
      }
    };

    res.status(200).json({
      data: invoiceDetails,
      message: "Invoice details fetched successfully"
    });
  } catch (error) {
    console.error('Error fetching invoice details:', error);
    res.status(500).json({
      error: "Error in fetching invoice details"
    });
  }
};

// Get all user orders with pagination (optional)
const get_all_user_orders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ userid: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'subscription_redemption.subscriptionId',
        select: 'plan credits'
      });

    const totalOrders = await Order.countDocuments({ userid: req.user._id });

    res.status(200).json({
      data: orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders,
        limit
      },
      message: "User orders fetched successfully"
    });
  } catch (error) {
    console.error('Error fetching all user orders:', error);
    res.status(500).json({
      error: "Error in fetching user orders"
    });
  }
};

// Get order statistics for user
const get_user_order_stats = async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await Order.aggregate([
      { $match: { userid: userId } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { 
            $sum: { $toDouble: "$order_finalamount" } 
          },
          averageOrderValue: { 
            $avg: { $toDouble: "$order_finalamount" } 
          },
          totalItems: { 
            $sum: { $toInt: "$order_totalcloths" } 
          }
        }
      }
    ]);

    // Get counts by payment status
    const statusCounts = await Order.aggregate([
      { $match: { userid: userId } },
      {
        $group: {
          _id: "$payment_status",
          count: { $sum: 1 }
        }
      }
    ]);

    // Get monthly order trends
    const monthlyTrends = await Order.aggregate([
      { $match: { userid: userId } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 },
          total: { $sum: { $toDouble: "$order_finalamount" } }
        }
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 6 }
    ]);

    res.status(200).json({
      data: {
        summary: stats[0] || {
          totalOrders: 0,
          totalSpent: 0,
          averageOrderValue: 0,
          totalItems: 0
        },
        statusBreakdown: statusCounts,
        monthlyTrends
      },
      message: "Order statistics fetched successfully"
    });
  } catch (error) {
    console.error('Error fetching order stats:', error);
    res.status(500).json({
      error: "Error in fetching order statistics"
    });
  }
};

// Update order payment details
const update_order_payment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const paymentDetails = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        error: "Order not found"
      });
    }

    // Verify ownership
    if (order.userid.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: "You don't have permission to update this order"
      });
    }

    // Update payment details
    order.payment_details = {
      ...order.payment_details,
      ...paymentDetails,
      paid_at: paymentDetails.paid_at || new Date()
    };

    if (paymentDetails.status) {
      order.payment_status = paymentDetails.status;
    }

    await order.save();

    res.status(200).json({
      data: order,
      message: "Payment details updated successfully"
    });
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({
      error: "Error in updating payment details"
    });
  }
};

// Cancel order
const cancel_order = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        error: "Order not found"
      });
    }

    // Verify ownership
    if (order.userid.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: "You don't have permission to cancel this order"
      });
    }

    // Check if order can be cancelled
    if (!order.canBeCancelled()) {
      return res.status(400).json({
        error: "Order cannot be cancelled at this stage"
      });
    }

    order.cancellation_reason = reason;
    order.cancelled_at = new Date();

    // If payment was made, update status to refunded or pending refund
    if (order.payment_status === 'paid') {
      order.payment_status = 'refunded';
      
      // Add refund details if you have them
      if (!order.payment_details) {
        order.payment_details = {};
      }
      order.payment_details.refund_details = {
        refund_id: `REF${Date.now()}`,
        refunded_at: new Date(),
        refund_amount: parseFloat(order.order_finalamount),
        refund_reason: reason
      };
    }

    await order.save();

    res.status(200).json({
      data: order,
      message: "Order cancelled successfully"
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({
      error: "Error in cancelling order"
    });
  }
};





export {
  createorder,
  getorder_by_id,
  update_flow_order,
  get_user_orders,
  get_user_last_order,
  verifyOrderPayment,
  get_order_by_id,
  get_order_invoice_details,
  get_all_user_orders,
  get_user_order_stats,
  update_order_payment,
  cancel_order
};
