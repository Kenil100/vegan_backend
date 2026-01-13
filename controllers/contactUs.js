import Contact from "../models/Contact.js";

export const sendMessage=async(req,res)=>{
  try {
      const {userId,fullName,email,message}=req.body;
      if(!userId || !fullName || !email || !message)
      {
        return res.status(400).json({ status: 400, message: "All fields are required"});
      }

      await Contact.create({userId,fullName,email,message});
     return res.status(201).json({ status: 201, message: " Your message has been successfully submitted."});
  } catch (error) {
     return res.status(500).json({ status: 500, message: "Internal server error" });
  }
}

export const getAllMessages=async(req,res)=>{
  try {
      const contactData=await Contact.find();
     return res.status(201).json({ status: 201, message: "Messages fetched successfully",data:contactData});
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
} 