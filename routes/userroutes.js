import express from "express";
import {
  AddwalletMoney,
  Enquerymail,
  generateEmailOtp,
  getProfile,
  Login,
  Logout,
  Profileupdate,
  SignUp,
} from "../controllers/usercontroller.js";
import Authuser from "../middlewares/authuser.js";

const router = express.Router();

router.post("/signup", SignUp);
router.post("/generatemailotp", generateEmailOtp);
router.post("/login", Login);
router.post("/enquery", Enquerymail);
router.put("/addwalletmoney", AddwalletMoney);
router.delete("/logout", Logout);
router.put("/updateprofile", Authuser, Profileupdate);
router.get("/profile", Authuser, getProfile);

export default router;
