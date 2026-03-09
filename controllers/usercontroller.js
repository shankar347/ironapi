import sendOTP from "../helper/emailsender.js";
import createTokenandCookies from "../middlewares/createtoken.js";
import createToken from "../middlewares/createtoken.js";
import Email from "../models/emailschema.js";
import User from "../models/userschema.js";
import bcryptjs from "bcryptjs";
import sendEnquiryConfirmation from "../helper/emailenquery.js";
import Banner from "../models/bannerschema.js";
import Video from "../models/videoschema.js";
import Subscription from "../models/subscreptionschema.js";

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
}

const SignUp = async (req, res) => {
  try {
    const { data, isagentapplied } = req.body;

    console.log(data, isagentapplied, "hi");
    const {
      name,
      email,
      phoneno,
      password,
      houseno,
      streetname,
      area,
      city,
      pincode,
    } = data;

    console.log(houseno, streetname, area, city, pincode);

    if (
      !name ||
      !email ||
      !phoneno ||
      !houseno ||
      !streetname ||
      !area ||
      !city ||
      !pincode
    ) {
      res.status(400).json({
        error: "Provide all the required fields",
      });
    }

    const checkemail = await User.findOne({ email });

    if (checkemail) {
      return res.status(400).json({
        error: "User is already registered with this email",
      });
    }

    const checkphoneno = await User.findOne({ phoneno });

    if (checkphoneno) {
      return res.status(400).json({
        error: "User is already registered with this phone numeber",
      });
    }

    if (isagentapplied) {
      const agent = new User({
        name,
        email,
        phoneno,
        address: {
          houseno,
          streetname,
          area,
          city,
          pincode,
        },
        isagentapplied: true,
      });

      await agent.save();

      return res.status(200).json({
        data: agent,
        message: "Welcome! wait until admin verifies your approval",
      });
    }

    const hashsalt = bcryptjs.genSaltSync(10);
    const hashedpassword = bcryptjs.hashSync(password, hashsalt);

    const user = new User({
      name,
      email,
      phoneno,
      password: hashedpassword,
      address: {
        houseno,
        streetname,
        area,
        city,
        pincode,
      },
    });

    await user.save();

    const token = createTokenandCookies(req, res, user.toObject());

    console.log('user',user)

    res.status(200).json({
      data: user,
      message: "Welcome! Registered successfully",
    });
  } catch (err) {
    res.json(err);
    console.log(err);
  }
};

const Login = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const findOtp = await Email.findOne({
      email,
      otp,
    });

    if (!findOtp) {
      return res.status(500).json({
        error: "Invalid OTP",
      });
    }

    if (findOtp.expiry < Date.now()) {
      return res.status(500).json({
        error: "OTP expired",
      });
    }

    const user = await User.findOne({ email });

    const token = createTokenandCookies(req, res, user.toObject());

    res.status(200).json({
      data: user,
      message: "User Logged in  successfully",
    });
  } catch (err) {
    res.json({ err: err });
    console.log(err);
  }
};          

const generateEmailOtp = async (req, res) => {
  try {
    const { formdata, isagentlogin } = req.body;
    const { email } = formdata;

    const checkemail = await User.findOne({ email });

    if (!checkemail) {
      return res.status(400).json({
        error: "User is not registered with this email",
      });
    }

    if (isagentlogin && !checkemail.isagentapplied && !checkemail.isagent) {
      return res.status(400).json({ 
        error: "Sorry user!, Agent only can login here" 
      });
    }

    if (checkemail.isagentapplied && !checkemail.isagent) {
      return res.status(404).json({ 
        error: "Sorry Agent!, Admin is not activated you yet" 
      });
    }

    let otp = generateOTP();
    const expiry = Date.now() + 5 * 60 * 1000;

    await Email.create({ email, otp, expiry });
    console.log(`Generated OTP for ${email}: ${otp}`);

    // Send OTP email 
    await sendOTP(email, otp);

    return res.status(200).json({
      message: "OTP sent successfully",
    });
  } catch (err) {
    console.error('Error in generateEmailOtp:', err);
    res.status(500).json({
      error: "Error in generating Email OTP",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user_id = req?.user?._id;

    let user = await User.findById(user_id);

    if (!user) {
      return res.status(400).json({
        error: "User is not registered in this website",
      });
    }

    let subscription = await Subscription.findOne({
      userid: user_id,
      status: "active"
    }).sort({ createdAt: -1 });

    // check expiry
    if (subscription && subscription.enddate && subscription.enddate < new Date()) {
      subscription.status = "expired";
      await subscription.save();
      subscription = null;
    }

    // convert mongoose document → plain object
    const userObj = user.toObject();

    userObj.subscription = subscription;  

    res.status(200).json({
      data: userObj,
      message: "User profile fetched successfully",
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: "Error in fetching profile",
    });
  }
};


const Profileupdate = async (req, res) => {
  try {
    const {
      name,
      email,
      phoneno,
      password,
      houseno,
      streetname,
      area,
      city,
      pincode,
    } = req.body;

    const user_id = req?.user?._id;

    const user = await User.findById(user_id);

    if (!user) {
      return res.status(400).json({
        error: "User is not registered in this website",
      });
    }

    if (name) user.name = name;
    if (password) {
      let bcryptsalt = bcryptjs.genSaltSync(10);
      let hashedpassword = bcryptjs.hashSync(password, bcryptsalt);
      user.password = hashedpassword;
    }
    if (phoneno) user.phoneno = phoneno;

    if (pincode) user.address.pincode = pincode;
    if (houseno) user.address.houseno = houseno;
    if (streetname) user.address.streetname = streetname;
    if (area) user.address.area = area;
    if (city) user.address.city = city;

    await user.save();

    res.status(200).json({
      data: user,
      message: "User profile updated successfully",
    });
  } catch (err) {
    res.json({ err: "Error in updating profile" });
    console.log(err);
  }
};

const AddwalletMoney = async (req, res) => {
  try {
  } catch (err) {
    res.json({ err: err });
    console.log(err);
  }
};

const Logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/", // must match cookie path
    });
    res.status(200).json({ message: "User Logged out successfully" });
  } catch (err) {
    res.json({ err: "Error in Logout user!" });
    console.log(err);
  }
};

const Enquerymail = async (req, res) => {
  try {
    const formData = req.body;

    sendEnquiryConfirmation(formData);

    res.status(200).json({ message: "Enquery sended successfully" });
  } catch (err) {
    res.json({ err: "Error in Logout user!" });
    console.log(err);
  }
};

const getbanners=async(req,res)=>{
    try{
          const Banners=await Banner.find({})

          res.status(200).json({
            message:"banners fetched successfully",
            daa:Banners
          })
    }
    catch (err) {
    res.json({ err: "Error in Logout user!" });
    console.log(err);
  }
}

const getHomevideo=async(req,res)=>{
  try{
const Homevideo=await Video.findOne({name:'homevideo'})

  if(!Homevideo)
  {
    return res.status(404).json({error:"Video not found"})
  }

  res.status(200).json({message:"Video fetched successfully",
    data:Homevideo
  })

  }
  catch (err) {
    res.json({ err: "Error in Logout user!" });
    console.log(err);
  }
}

  const createSubscriptionorder = async (req, res) => {
    try {

      const { plan, credits, totalamount, cloths } = req.body;

      // Basic validation
      if (!plan || !totalamount) {
        return res.status(400).json({
          success: false,
          message: "Plan and total amount are required"
        });
      }

      const startdate = new Date();
      let enddate = null;

      // Only Popular plan → 30 days validity
      // if (plan === "Popular plan") {
        enddate = new Date(startdate);
        enddate.setDate(enddate.getDate() + 30);
      // }

      let subcredits=0

      cloths.forEach((cloth)=>{
        subcredits+=cloth.count
      })
      const subscription = new Subscription({
        userid: req.user.id,
        plan,
        credits: subcredits || 0,
        totalcredits:subcredits,
        totalamount,
        cloths,
        startdate,
        enddate,
        status: "active"
      });

      console.log(subscription)
      await subscription.save();

      res.status(201).json({
        success: true,
        message: "Subscription created successfully",
        subscription
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        err: "Error in Create Subscription Order"
      });
    }
  };


  const updateSubscriptionAfterOrder = async (req, res) => {
  try {

    const { usedCredits, items } = req.body;
    const userid = req.user.id;

    const subscription = await Subscription.findOne({
      userid,
      status: "active"
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Active subscription not found"
      });
    }

    // Check credits
    if (subscription.credits < usedCredits) {
      return res.status(400).json({
        success: false,
        message: "Not enough credits"
      });
    }

    // Validate cloth counts
    for (let item of items) {

      const cloth = subscription.cloths.find(
        c => c.name.toLowerCase() === item.name.toLowerCase()
      );

      if (!cloth) {
        return res.status(400).json({
          success: false,
          message: `${item.name} not allowed in this plan`
        });
      }

      if (cloth.count < item.count) {
        return res.status(400).json({
          success: false,
          message: `Not enough ${item.name} remaining`
        });
      }
    }

    // Update credits
    subscription.credits -= usedCredits;

    // Update cloth counts
    items.forEach(item => {

      const cloth = subscription.cloths.find(
        c => c.name.toLowerCase() === item.name.toLowerCase()
      );

      cloth.count -= item.count;

    });

    await subscription.save();

    res.status(200).json({
      success: true,
      message: "Subscription updated successfully",
      subscription
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Error updating subscription"
    });

  }
};


const getSubscriptionById = async (req, res) => {
  try {

    const { id } = req.params;

    const subscription = await Subscription.findById(id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found"
      });
    }

    res.status(200).json({
      success: true,
      subscription
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Error fetching subscription"
    });

  }
};


export {
  SignUp,
  Login,
  Logout,
  getProfile,
  // getcumstomertransactiondetails,
  AddwalletMoney,
  Profileupdate,
  generateEmailOtp,
  Enquerymail,
  getbanners,
  getHomevideo,
  createSubscriptionorder,
  updateSubscriptionAfterOrder,
  getSubscriptionById
};
