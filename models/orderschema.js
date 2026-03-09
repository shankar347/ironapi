import mongoose from "mongoose";

const Addresschema = new mongoose.Schema({
  houseno: {
    type: String,
  },
  streetname: {
    type: String,
  },
  area: {
    type: String,
  },
  city: {
    type: String,
  },
  pincode:{
    type:String
  }
});

const Orderflowschema = new mongoose.Schema(
  {
    step: {
      type: String,
      enum: [
        "Order placed",
        "Agent arriving",
        "Collected clothes",
        "Clothes arriving to customer",
        "Clothes delivered",
      ],
    },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
  },
  { _id: false }
);

// Schema for redeemed items from subscription
const RedeemedItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    required: true,
    min: 1
  },
  cost: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false });

// Schema for subscription redemption details
const SubscriptionRedemptionSchema = new mongoose.Schema({
  used: {
    type: Boolean,
    default: false
  },
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subscription",
    required: function() {
      return this.used === true;
    }
  },
  redeemedCredits: {
    type: Number,
    default: 0,
    min: 0
  },
  redeemedItems: [RedeemedItemSchema],
  redeemedAt: {
    type: Date
  }
}, { _id: false });

// Schema for payment details
const PaymentDetailsSchema = new mongoose.Schema({
  payment_id: {
    type: String,
    sparse: true
  },
  order_id: {
    type: String,
    sparse: true
  },
  signature: {
    type: String
  },
  method: {
    type: String,
    enum: ['card', 'upi', 'netbanking', 'wallet', 'razorpay_payment_link','razorpay'],
    default: 'razorpay'
  },
  paid_at: {
    type: Date
  },
  amount_paid: {
    type: Number,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  refund_details: {
    refund_id: String,
    refunded_at: Date,
    refund_amount: Number,
    refund_reason: String
  }
}, { _id: false });

const Orderschema = new mongoose.Schema(
  {
    orderid: {
      type: Number,
      unique: true
    },
    userid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    user_name: {
      type: String,
      required: true
    },
    user_phoneno: {
      type: String,
      required: true
    },
    user_address: {
      type: Addresschema,
      required: true
    },
    order_date: {
      type: String,
      required: true
    },
    order_cloths: [{
      item: {
        type: String,
        required: true
      },
      cost: {
        type: String,
        required: true
      },
      quantity: {
        type: String,
        required: true
      }
    }],
    // Original total amount before any discounts/redemptions
    order_totalamount: {
      type: String,
      required: true
    },
    // Final amount after subscription redemption (payable amount)
    order_finalamount: {
      type: String,
      required: true
    },
    order_totalcloths: {
      type: String,
      required: true
    },
    order_slot: {
      type: String,
      required: true
    },
    order_paymenttype: {
      type: String,
      enum: ['online',  'card', 'upi','cash on delivery'],
      required: true
    },
    order_deliveryspeed: {
      type: String,
      enum: ['normal', 'express', 'same_day'],
      default: 'normal'
    },
    
    // Payment status and details
    payment_status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
      default: 'pending'
    },
    payment_details: {
      type: PaymentDetailsSchema,
      default: {}
    },
    
    // Subscription redemption details
    subscription_redemption: {
      type: SubscriptionRedemptionSchema,
      default: () => ({ used: false })
    },
    
    // Order flow tracking
    order_flow: {
      type: [Orderflowschema],
      default: () => [
        { step: "Order placed", completed: true, completedAt: new Date() },
        { step: "Agent arriving", completed: false },
        { step: "Collected clothes", completed: false },
        { step: "Clothes arriving to customer", completed: false },
        { step: "Clothes delivered", completed: false }
      ]
    },
    
    // Agent details
    agent_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    agent_name: {
      type: String
    },
    agent_phoneno: {
      type: String
    },
    
    // Additional metadata
    notes: {
      type: String
    },
    cancellation_reason: {
      type: String
    },
    cancelled_at: {
      type: Date
    }
  },
  { timestamps: true }
);

// Indexes for better query performance
Orderschema.index({ userid: 1, createdAt: -1 });
Orderschema.index({ orderid: 1 }, { unique: true });
Orderschema.index({ payment_status: 1 });
Orderschema.index({ 'subscription_redemption.subscriptionId': 1 });
Orderschema.index({ 'payment_details.payment_id': 1 }, { sparse: true });
Orderschema.index({ 'payment_details.order_id': 1 }, { sparse: true });

// Virtual for checking if order is fully paid
Orderschema.virtual('isPaid').get(function() {
  return this.payment_status === 'paid';
});

// Virtual for checking if subscription was used
Orderschema.virtual('hasSubscriptionRedemption').get(function() {
  return this.subscription_redemption && this.subscription_redemption.used === true;
});

// Virtual for discount amount
Orderschema.virtual('discountAmount').get(function() {
  if (this.hasSubscriptionRedemption) {
    return Number(this.order_totalamount) - Number(this.order_finalamount);
  }
  return 0;
});

// Method to check if order can be cancelled
Orderschema.methods.canBeCancelled = function() {
  // Can cancel only if not delivered and not cancelled
  const deliveredStep = this.order_flow.find(step => step.step === "Clothes delivered");
  return !deliveredStep?.completed && !this.cancelled_at;
};

// Pre-save middleware to ensure data consistency
Orderschema.pre('save', function(next) {
  // Ensure order_finalamount is not greater than order_totalamount
  if (Number(this.order_finalamount) > Number(this.order_totalamount)) {
    this.order_finalamount = this.order_totalamount;
  }
  
  // If payment is online and payment_status is 'paid', ensure payment details exist
  if (this.order_paymenttype === 'online' && this.payment_status === 'paid') {
    if (!this.payment_details || !this.payment_details.payment_id) {
      next(new Error('Online payment must have payment details'));
    }
  }
  
  // Set redeemedAt if subscription was used
  if (this.subscription_redemption?.used && !this.subscription_redemption.redeemedAt) {
    this.subscription_redemption.redeemedAt = new Date();
  }
  
  next();
});

// Static method to find orders using subscription
Orderschema.statics.findBySubscription = function(subscriptionId) {
  return this.find({
    'subscription_redemption.used': true,
    'subscription_redemption.subscriptionId': subscriptionId
  }).sort({ createdAt: -1 });
};

const Order = mongoose.model("Order", Orderschema);

export default Order;