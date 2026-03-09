import express from "express";
import Authuser from "../middlewares/authuser.js";
import {
  createorder,
  get_user_last_order,
  get_user_orders,
  getorder_by_id,
  update_flow_order,
  verifyOrderPayment,
} from "../controllers/ordercontroller.js";
import Authadmin from "../middlewares/authadmin.js";
import Authagent from "../middlewares/authagent.js";

const router = express.Router();

router.post("/createorder", Authuser, createorder);
// In your payment routes
router.post('/verify-order-payment', verifyOrderPayment);
router.put("/updateorder", Authuser, Authagent, update_flow_order);
router.get("/getuserorders", Authuser, get_user_orders);
router.get("/getusrlastorder", Authuser, get_user_last_order);
router.get("/:id/getorderbyid", Authuser, getorder_by_id);

export default router;
