import express from "express";
import { getAllMessages, sendMessage } from "../controllers/contactUs.js";
const router = express.Router();

router.post("/sendmessage", sendMessage);
router.get('/getallmessages',getAllMessages)

export default router;
