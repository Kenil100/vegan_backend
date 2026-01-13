import express from "express";
import { cancelOrder, getAllOrderData, getOrderDetails } from "../controllers/orderController.js";

const router = express.Router();

router.get("/getallorders/:userId",getAllOrderData);
router.get('/getorderDetails/:userId/:orderId',getOrderDetails);
router.patch('/cancelorder/:orderId',cancelOrder)

export default router;
