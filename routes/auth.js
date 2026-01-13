import express from "express";
import { signup, sendOtp, verifyOtp, sendEmailOtp, verifyEmailOtp, updateUser, logoutUser, getUserData, addCardDetail, deleteCardDetail, getAllCardDetails, updateCardDetails, getcarddetailsbyId,
} from "../controllers/authController.js";
import {verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/logout", logoutUser);
router.post('/addcarddetails',verifyToken,addCardDetail)
router.post("/send-email-otp", verifyToken, sendEmailOtp);
router.post("/verify-email-otp", verifyToken, verifyEmailOtp);

router.get('/getallcarddetails',verifyToken,getAllCardDetails);
router.get('/getcarddetailsbyId/:cardId',verifyToken,getcarddetailsbyId);

router.get('/verify',verifyToken,getUserData);

router.put("/update-user", verifyToken, updateUser);
router.put('/updatecarddetails/:cardId',verifyToken,updateCardDetails);

router.delete('/deletecarddetails/:cardId',deleteCardDetail);

export default router;
