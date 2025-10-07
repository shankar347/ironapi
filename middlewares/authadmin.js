
const Authadmin=(req,res,next)=>{

   if (!req.user?.isadmin)
   {
    res.status(400).json({
        error:"Access denied! Admin only "
    })
   }
   next()

}

export default Authadmin