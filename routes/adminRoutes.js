import express from "express"
import {adminLogin,adminSignup} from '../controllers/adminController.js'
import {adminOnly} from "../middleware/adminOnly.js";

const router = express.Router();

router.post("/signup",adminSignup);
router.post("/login",adminLogin);

export default router;