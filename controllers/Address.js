import Address from "../models/Address.js";

export const addAddress = async (req, res) => {
  try{
    const userId = req.user.id;
    const {apartment,address, city,state,country,pincode,type }=req.body;
    if(!apartment || !address || !city || !state || !country || !pincode || !type ){
      return res.status(400).json({status: 400,message:"All required fields must be filled."})
    }
    if(!/^\d{6}$/.test(pincode)){
      return res.status(400).json({ status: 400, message: "Pincode must be a 6-digit number." });
    }
    const newAddress  = await Address.create({ userId, apartment, address, city, state, country, pincode, type})
    return res.status(201).json({ status: 201, message: "Address added successfully",data:newAddress });
  }
  catch(err){
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};

export const getAddresses = async (req,res)=>{
  try{
    const userId = req.user.id;
    const addresses = await Address.find({userId}).sort({createdAt:-1});
    return res.status(200).json({ status: 200, message: "Address updated successfully",data:addresses });
  }
  catch(err){
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
}

export const updateAddress  = async (req,res)=>{
  try{
      const {id} = req.params;
      const userId = req.user.id;
      const updated  = await Address.findOneAndUpdate(
        {_id:id,userId},
        {...req.body},
        {new:true}
      )
      if(!updated) return res.status(404).json({status: 400,message:"Address not found"});
      return res.status(200).json({ status: 200, message: "Address updated successfully",data:updated });
  }
  catch(err){
     return res.status(500).json({ status: 500, message: "Internal server error" });
  }
}

export const deleteAddress = async (req,res)=>{
  try{
    const {id} = req.params;
    const userId = req.user.id;
    const deleted = await Address.findOneAndDelete({_id:id,userId});
    if(!deleted) return res.status(404).json({status: 400,message:"Address not found"});
    return res.status(200).json({ status: 200, message: "Address Deleted successfully" });
  }
  catch(err){
   return res.status(500).json({ status: 500, message: "Internal server error" });
  }
}
