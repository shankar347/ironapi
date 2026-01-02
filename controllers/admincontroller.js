import Banner from "../models/bannerschema.js";
import Order from "../models/orderschema.js";
import User from "../models/userschema.js";
import {v2 as cloudinary}  from 'cloudinary'
import Video from "../models/videoschema.js";
import Bookitem from "../models/bookitemschema.js";
import Bookslot from "../models/bookslotshema.js";

const getAllusers = async (req, res) => {
  try {
    const Users = await User.find({ isagent: false, isagentapplied: false }).sort({createdAt:-1});
    res
      .status(200)
      .json({ data: Users, message: "Users fetched successfully" });
  } catch (error) {
    console.log(error);
  }
};

const deleteuser = async (req, res) => {
  try {
    const user = await User.findById(req?.params?.id);

    if (!user) {
      return res.status(404).json({ error: "User is not found to remove" });
    }

    // console.log(req.body,'body')
    // console.log(req.body.user_id)

    await User.findByIdAndDelete(req?.params.id);

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.log(error);
  }
};

const getAllagents = async (req, res) => {
  try {
    const Agents = await User.find({ isagent: true }).sort({createdAt:-1});

    res
      .status(200)
      .json({ data: Agents, message: "Agents fetched successfully" });
  } catch (error) {
    console.log(error);
  }
};

const getAllagentsapplied = async (req, res) => {
  try {
    const Agents = await User.find({ isagentapplied: true, isagent: false });

    res
      .status(200)
      .json({ data: Agents, message: "Agents fetched successfully" });
  } catch (error) {
    console.log(error);
  }
};

const getAgentorders = async (req, res) => {
  try {
    const Orders = await Order.find({ agent_id: req?.user?._id });

    res
      .status(200)
      .json({ message: "Agent orders fetched successful", data: Orders });
  } catch (error) {
    console.log(error);
  }
};

const getAgenttodayorders = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // End of the day
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

   

    // Fetch orders for today
    const Orders = await Order.find({
      agent_id: req?.user?._id,
      order_date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });
    res
      .status(200)
      .json({ message: "Agent today orders fetched successful", data: Orders });
  } catch (error) {
    console.log(error);
  }
};

const gettodayorders = async (req, res) => {
  try {
    // Today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    // Yesterday's date range (for orders that said "tomorrow")
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const startOfYesterday = new Date(yesterday);
    startOfYesterday.setHours(0, 0, 0, 0);
    
    const endOfYesterday = new Date(yesterday);
    endOfYesterday.setHours(23, 59, 59, 999);

    const Orders = await Order.find({
      $or: [
        {
          // Orders placed today
          order_date: {
            $gte: today,
            $lte: endOfToday,
          }
        },
        {
          // Orders placed yesterday that have "tomorrow" in order_slot
          // (meaning their "tomorrow" is today)
          order_date: {
            $gte: startOfYesterday,
            $lte: endOfYesterday,
          },
          order_slot: { 
            $regex: /tomorrow/i
          }
        }
      ]
    }).sort({ createdAt: -1 });

    res
      .status(200)
      .json({ 
        message: "Today orders fetched successfully", 
        data: Orders,
        count: Orders.length
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching orders", error: error.message });
  }
};

const deleteorder=async(req,res)=>{
  try{
const findOrder=await Order.findById(req.params.id)

if (!findOrder)
{
  return res.status(404).json({error:"Order not found"})
}
  
  await Order.findByIdAndDelete(req.params.id)

  res.status(200).json({message:"Order deleted successfully"})

  }
  catch(err)
  {
    console.log(err)
  }
}



const acceptAgentlogin = async (req, res) => {
  try {
    const { agent_id, action } = req.body;

    const agent = await User.findById(agent_id);

    if (!agent) {
      res.status(404).json({ error: "Agent is not found" });
    }

    agent.isagent = action;

    await agent.save();

    res
      .status(200)
      .json({ message: "Agent orders fetched successful", data: agent });
  } catch (error) {
    console.log(error);
  }
};

const getAllorders = async (req, res) => {
  try {
    const Orders = await Order.find({}).sort({createdAt:-1});

    res
      .status(200)
      .json({ data: Orders, message: "Orders fetched successfully" });
  } catch (error) {
    console.log(error);
  }
};

const assignAgenttoOrders = async (req, res) => {
  try {
    const { order_id, agent_id } = req.body;

    const order = await Order.findById(order_id);

    if (!order) {
      res.status(404).json({ error: "Order not found to assign Agent" });
      return;
    }

    const agent = await User.findById(agent_id);

    if (!agent) {
      return res.status(404).json({ error: "Agent not found ot assing order" });
    }

    order.agent_id = agent._id;
    order.agent_name = agent.name;
    order.agent_phoneno = agent.phoneno;

    await order.save();

    res
      .status(200)
      .json({ data: order, message: "Agent assigned to order successfully" });
  } catch (error) {
    res.json(error);
  }
};



 const updatebanner = async (req, res) => {
  try {
    const { header, subHeader } = req.body;

    if (!req.file || !header || !subHeader) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Convert Multer buffer -> Cloudinary stream upload
    const uploadToCloudinary = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "banners" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
    };

    const uploadResult = await uploadToCloudinary();
    // console.log(uploadResult)

    const newBanner = new Banner({
      header,
      subHeader,
      banner: uploadResult.secure_url,
    });

    await newBanner.save();

    res.status(201).json({
      message: "Banner uploaded successfully",
      banner: newBanner,
    });
  } catch (error) {
    console.error("Error uploading banner:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const getBanners=async(req,res)=>{
  try{
    const Banners=await Banner.find({})

    res.status(200).json({"message":"Banners fetched successfully",
      data:Banners
    })
  }
  catch (error) {
    console.error("Error uploading banner:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}

const Editbanners=async(req,res)=>{
   try{
      const {id} = req.params

      const { header, subHeader } = req.body;

  
      const banner =  await Banner.findById(id)

      if (!banner)
      {
        res.status(404).message({error:"Banner not found"})
      }

      if (header) banner.header = header
      if (subHeader) banner.subHeader = subHeader

      if (req.file)
      {
  const uploadToCloudinary = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "banners" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
    };

    const uploadResult = await uploadToCloudinary();

     banner.banner = uploadResult.secure_url
      }


    await banner.save();

    res.status(201).json({
      message: "Banner updated successfully",
      banner: banner,
    });

   }
   catch (error) {
    console.error("Error uploading banner:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}

const deletebanner=async(req,res)=>{
  try{
   const {id} = req.params
   const banner=await Banner.findById(id)

   if (!banner)
   {
    return res.status(404).json({errror:"Banner not found"})
   }

  await Banner.findByIdAndDelete(id)

  res.status(200).json({message:"Banner deleted successfullly"})

  }
  catch (error) {
    console.error("Error uploading banner:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}

  const uploadHomeVideo = async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No video file provided" });
      }

      // Upload video to Cloudinary
      const uploadToCloudinary = () => {
        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "homepage_videos",
              resource_type: "video",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(req.file.buffer);
        });
      };

      const uploadResult = await uploadToCloudinary();

      // Check if a document with name 'homevideo' exists
      let existingVideo = await Video.findOne({ name: "homevideo" });

      if (existingVideo) {
        // Update existing video URL
        existingVideo.video = uploadResult.secure_url;
        await existingVideo.save();

        return res.status(200).json({
          message: "Homepage video updated successfully",
          video: existingVideo,
        });
      } else {
        // Create new video document
        const newVideo = new Video({
          name: "homevideo",
          video: uploadResult.secure_url,
        });

        await newVideo.save();

        return res.status(201).json({
          message: "Homepage video created successfully",
          video: newVideo,
        });
      }
    } catch (error) {
      console.error("Error uploading video:", error);
      res.status(500).json({
        message: "Video upload failed",
        error: error.message,
      });
    }
  };


const createbookItems=async(req,res)=>{
  try{
      const {name,price} = req.body
      // console.log(name,price,'hi')
      if (!name ||  !price) 
      {
        return res.status(400).json({error:"Both Name and price is required"})
      }

      const BookItem=new Bookitem({
        name,
        price
      })

      await BookItem.save()

      res.status(200).json({message:"Book Item added successfully"})
  }
  catch(error)
  {
   console.error("Error uploading video:", error);
    res.status(500).json({
      message: "Items upload failed",
      error: error.message,
    });
  }
}

const getbookItems=async(req,res)=>{
  try{
    const Bookitems=await Bookitem.find({}).sort({createdAt:1})

    res.status(200).json({message:"Book items fetched successfully",
      data:Bookitems
    })

  }
  catch(error)
  {
   console.error("Error uploading video:", error);
    res.status(500).json({
      message: "Items upload failed",
      error: error.message,
    });
  }
}

const deletebookItems=async(req,res)=>{
  try{
    const findItems=await Bookitem.findById(req.params.id)
    
    if (!findItems)
    {
      return res.status(404).json({error:"Item not found"})
    }

    await Bookitem.findByIdAndDelete(req.params.id)

    return res.status(200).json({message:"Book item deleted successfully"
    })

  }
  catch(error)
  {
   console.error("Error uploading video:", error);
    res.status(500).json({
      message: "Items upload failed",
      error: error.message,
    });
  }
}

const editbookitems=async(req,res)=>{
 try{

  const {name,price}=req.body

  const findItems=await Bookitem.findById(req.params.id)

  if (!findItems)
  {
    return res.status(404).json({error:"Item not found"})
  }

   if (name) findItems.name  = name 
   if (price) findItems.price = price

   await findItems.save()

   return res.status(200).json({message:"Item updated successfully"
    ,data:findItems
 })

 }
  catch(error)
  {
   console.error("Error uploading video:", error);
    res.status(500).json({
      message: "Items upload failed",
      error: error.message,
    });
  }
}




// Toggle status (Admin only)
 const toggleBookingStatus = async (req, res) => {
    try {
        const adminId = req.user?.id || "admin";
        
        const currentStatus = await Bookslot.findOne();
        let isOpen = true;
        
        if (currentStatus) {
            isOpen = !currentStatus.isOpen;
        }
        
        const updatedStatus = await Bookslot.findOneAndUpdate(
            {},
            { 
                isOpen, 
                lastUpdated: Date.now(),
                updatedBy: adminId 
            },
            { 
                new: true, 
                upsert: true,
                setDefaultsOnInsert: true 
            }
        );
        
        res.status(200).json({
            success: true,
            message: `Booking slots are now ${isOpen ? 'OPEN' : 'CLOSED'}`,
            data: updatedStatus
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error toggling booking status",
            error: error.message
        });
    }
};



const getBookingStatus = async (req, res) => {
    try {
        // Assuming you only have one document for the entire system
        let status = await Bookslot.findOne();
        
        // If no document exists, create one
        if (!status) {
            status = await Bookslot.create({ isOpen: true });
        }
        
        res.status(200).json({
            success: true,
            status: status.isOpen,
            lastUpdated: status.lastUpdated,
            updatedBy: status.updatedBy
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching booking status",
            error: error.message
        });
    }
};



export {
  getAllagents,
  getAllorders,
  getAllusers,
  deleteuser,
  assignAgenttoOrders,
  getAgentorders,
  deleteorder,
  getAgenttodayorders,
  acceptAgentlogin,
  getAllagentsapplied,
  gettodayorders,
  updatebanner,
  uploadHomeVideo,
  getBanners,
  Editbanners,
  deletebanner,
  createbookItems,
  editbookitems,
  deletebookItems,
  getbookItems,
  toggleBookingStatus,
  getBookingStatus
};
