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
        "Clothes reached warehouse",
        "Clothes arriving to customer",
        "Clothes delivered",
      ],
    },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
  },
  { _id: false }
);

const Orderschema = new mongoose.Schema(
  {
    userid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    user_name: {
      type: String,
    },
    user_phoneno: {
      type: String,
    },
    user_address: Addresschema,
    order_date: {
      type: String,
    },
    order_totalamount: {
      type: String,
    },
    order_totalcloths: {
      type: String,
    },
    order_slot: {
      type: String,
    },
    order_paymenttype:{
      type:String,
    },
    order_deliveryspeed:{
      type:String
    },
    order_flow: {
    type: [Orderflowschema],
    default: () => [
      { step: "Order placed", completed: true, completedAt: new Date() },
      { step: "Agent arriving", completed: false },
      { step: "Collected clothes", completed: false },
      { step: "Clothes reached warehouse", completed: false },
      { step: "Clothes arriving to customer", completed: false },
      { step: "Clothes delivered", completed: false }
    ]
  },
    agent_id: {
      type: mongoose.Schema.Types.ObjectId,
    },
    agent_name: {
      type: String,
    },
    agent_phoneno: {
      type: String,
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", Orderschema);

export default Order;
