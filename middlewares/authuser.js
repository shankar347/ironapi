import jwt from 'jsonwebtoken'
import User from '../models/userschema.js'



const Authuser=async(req,res,next)=>{

    try{
       const token=req?.cookies?.token 

       if (!token)
       {
        return res.status(400).json({
            error:"Cookie not found! Access Denied"
        })
       }

       const decoded=jwt.verify(token,process.env.JWT_KEY)

       const user=await User.findById(decoded._id).select('-password')

       if (!user)
       {
        return res.status(400).json({
            error:"User is not registered in this website"
        })
       }

       req.user= user

       next()

    }
    catch(err)
    {
        res?.status(500).json({
            error:"Error in authorizing user"
        })
    }

}

export default Authuser