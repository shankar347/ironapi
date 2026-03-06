import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema({

  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  plan: {
    type: String,
    required: true
  },

  credits: {
    type: Number,
    default: 0
  },

  totalamount: {
    type: Number,
    required: true
  },

  cloths: [
    {
      name: {
        type: String,
        required: true
      },
      count: {
        type: Number,
        required: true
      }
    }
  ],

  startdate: {
    type: Date,
    default: Date.now
  },

  enddate: {
    type: Date,
    default: null
  },

  status: {
    type: String,
    enum: ["active", "expired", "cancelled", "pending"],
    default: "pending"  // Changed from "active" to "pending"
  },

  // New payment fields
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed", "refunded"],
    default: "pending"
  },

  paymentId: {
    type: String,
    default: null
  },

  orderId: {
    type: String,
    default: null
  },

  paymentMethod: {
    type: String,
    enum: ["razorpay", "cash", "card", "upi"],
    default: "razorpay"
  },

  paymentDetails: {
    razorpay_payment_id: String,
    razorpay_order_id: String,
    razorpay_signature: String,
    paidAt: Date
  },

  invoiceNumber: {
    type: String,
    unique: true,
    sparse: true
  }

}, { timestamps: true });

// Generate invoice number before saving
SubscriptionSchema.pre('save', async function(next) {
  if (this.paymentStatus === 'paid' && !this.invoiceNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const count = await mongoose.model('Subscription').countDocuments({
      paymentStatus: 'paid',
      createdAt: {
        $gte: new Date(date.getFullYear(), date.getMonth(), 1),
        $lt: new Date(date.getFullYear(), date.getMonth() + 1, 1)
      }
    }) + 1;
    
    this.invoiceNumber = `INV-${year}${month}-${count.toString().padStart(4, '0')}`;
  }
  next();
});

const Subscription = mongoose.model("Subscription", SubscriptionSchema);

export default Subscription;