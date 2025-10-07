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
  pincode: {
    type: String,
  },
});

// placed , ontheway to pick,order picked, way to hub , processing , arriving, delivered  i am creating order schema  import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
    },
    phoneno: {
      type: String,
      required: true,
    },
    address: Addresschema,
    walletbalance: {
      type: Number,
      default: 0,
    },
    isagent: {
      type: Boolean,
      default: false,
    },
    isadmin: {
      type: Boolean,
      default: false,
    },
    isagentapplied:{
      type: Boolean,
      default:false   
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);

export default User;
