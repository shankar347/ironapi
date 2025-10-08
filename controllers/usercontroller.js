import sendOTP from "../helper/emailsender.js";
import createTokenandCookies from "../middlewares/createtoken.js";
import createToken from "../middlewares/createtoken.js";
import Email from "../models/emailschema.js";
import User from "../models/userschema.js";
import bcryptjs from "bcryptjs";
import sendEnquiryConfirmation from "../helper/emailenquery.js";

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
    console.log(isagentlogin, "hi");

    if (!checkemail) {
      return res.status(400).json({
        error: "User is not registered with this email",
      });
    }

    if (isagentlogin && !checkemail.isagentapplied && !checkemail.isagent) {
      res
        .status(400)
        .json({ error: "Sorry user!, Agent only can login here " });
    }

    if (checkemail.isagentapplied && !checkemail.isagent) {
      return res
        .status(404)
        .json({ error: "Sorry Agent!,  Admin is not activated you yet " });
    }

    let otp = generateOTP();

    const expiry = Date.now() + 5 * 60 * 1000;

    await Email.create({
      email,
      otp,
      expiry,
    });

    sendOTP(email, otp);

    return res.status(200).json({
      message: "OTP sent successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: "Error in generating Email Otp",
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user_id = req?.user?._id;

    const user = await User.findById(user_id);

    if (!user) {
      return res.status(400).json({
        error: "User is not registered in this website",
      });
    }

    res.status(200).json({
      data: user,
      message: "User profile fetched successfully",
    });
  } catch (err) {
    res.json({ err: "Error in fetching profile" });
    console.log(err);
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
};
