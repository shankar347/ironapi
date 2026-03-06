import express from "express";
import {
  AddwalletMoney,
  createSubscriptionorder,
  Enquerymail,
  generateEmailOtp,
  getbanners,
  getHomevideo,
  getProfile,
  getSubscriptionById,
  Login,
  Logout,
  Profileupdate,
  SignUp,
  updateSubscriptionAfterOrder,
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
router.get('/banners',getbanners)
router.get('/homevideo',getHomevideo)
router.post('/subscription',Authuser,createSubscriptionorder)
router.get('/subscription/:id',Authuser,getSubscriptionById)
router.put('/subscription/:id',Authuser,updateSubscriptionAfterOrder)


export default router;

