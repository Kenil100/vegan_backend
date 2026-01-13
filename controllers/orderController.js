import Order from "../models/Order.js";


export const getAllOrderData=async(req,res)=>{
   try {
    const userId = req.params.userId;
    const orders = await Order.find({userId}).sort({ createdAt: -1 });
    return res.status(200).json({ status: 200, message: "Order fetched successfully",data:orders });
  } catch (error) {
     return res.status(500).json({ status: 500, message: "Internal server error" });
  }
}

export const getOrderDetails=async(req,res)=>{
   try {
       const {userId,orderId} = req.params;
       const orderDetails=await Order.findOne({_id:orderId,userId});
       return res.status(200).json({ status: 200, message: "OrderDetails fetched successfully",data:orderDetails });
   } catch (error) {
      return res.status(500).json({ status: 500, message: "Internal server error" });
   }
}


export const cancelOrder=async(req,res)=>{
     try {
       const {orderId} = req.params;
      const canceledOrder=await Order.findByIdAndUpdate({_id:orderId},{$set:{status:"CANCELLED"}},{ new: true });
       return res.status(200).json({ status: 200, message: "Order canceled successfully",data:canceledOrder});
   } catch (error) {
      return res.status(500).json({ status: 500, message: "Internal server error" });
   }
}