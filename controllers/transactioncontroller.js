
const getcumstomertransactiondetails=async(req,res)=>{
      try{
            
    }
    catch(error)
    {   
        res.json({error:"Error in fetching transaction details"})
        console.log(err)
    }
}

const getalltransactions=async(req,res)=>{
 try{

    }
    catch(error)
    {   
        res.json({error:"Error in fetching transaction details"})
        console.log(err)
    }
}

const gettodaytransactions=async(req,res)=>{
 try{

    }
    catch(error)
    {   
        res.json({error:"Error in fetching transaction details"})
        console.log(err)
    }
}

const getpast30daytransactions=async(req,res)=>{
 try{

    }
    catch(error)
    {   
        res.json({error:"Error in fetching transaction details"})
        console.log(err)
    }
}

const getpast90daystransactions=async(req,res)=>{
 try{

    }
    catch(error)
    {   
        res.json({error:"Error in fetching transaction details"})
        console.log(err)
    }
}



export 
{
    getcumstomertransactiondetails,
    gettodaytransactions,
    getalltransactions,
    getpast30daytransactions,
    getpast90daystransactions
}