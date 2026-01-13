import express from "express";
import {
  addAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
} from "../controllers/Address.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add",verifyToken,addAddress);
router.get("/getalladdress", verifyToken, getAddresses);
router.put("/edit/:id", verifyToken, updateAddress);
router.delete("/delete/:id", verifyToken, deleteAddress);

export default router;
