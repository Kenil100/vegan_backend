import User from "../models/User.js";
import Otp from "../models/Otp.js";
import jwt from "jsonwebtoken";
import { sendSms } from "../utils/sendSms.js";
import EmailOtp from "../models/EmailOtp.js";
import Sib from "@sendinblue/client";
import Card from "../models/Card.js";

const OTP_EXPIRE = parseInt(process.env.OTP_EXPIRE_SECONDS || "300", 10); // 5 min

function genOtp() { return Math.floor(100000 + Math.random() * 900000).toString(); }

export const signup = async (req, res) => {
  try {
    const { firstName, lastName, email, phone } = req.body;
    if (!phone || !firstName || !lastName || !email) return res.status(400).json({ status: 400, message: "Please fill all fields correctly" });
    const existingUser = await User.findOne({ $or: [{ phone }, { email }] });

    if (existingUser) {
      let message = "User already exists";
      if (existingUser.phone === phone && existingUser.email === email) {
        message = "Phone and email already exist";
      } else if (existingUser.phone === phone) {
        message = "Phone number already exists";
      } else if (existingUser.email === email) {
        message = "Email already exists";
      }
      return res.status(409).json({ status: 409, message });
    }

    const userData = await User.create({ firstName, lastName, email, phone });
    return res.status(201).json({ status: 201, message: "Register successfully", data: userData });
  } catch (err) {
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};

export const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ status: 400, message: "Phone is required" });
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ status: 404, message: "Phone number does not exist" });
    }
    const code = genOtp();
    await Otp.deleteMany({ phone });
    await Otp.create({ phone, code, createdAt: new Date(), attempts: 0 });

    await sendSms(phone, `Your OTP is ${code}. It expires in ${OTP_EXPIRE / 60} minutes.`);

    return res.status(200).json({ status: 200, message: "OTP sent successfully", data: code });
  } catch (err) {
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { phone, code } = req.body;
    if (!phone) return res.status(400).json({ message: "Phone is required" });
    if (!code) return res.status(400).json({ message: "OTP is required" });

    const otpDoc = await Otp.findOne({ phone });
    if (!otpDoc) { return res.status(400).json({ status: 400, message: "No OTP found. Request a new OTP." }); }

    const age = (Date.now() - otpDoc.createdAt.getTime()) / 1000;
    if (age > OTP_EXPIRE) {
      await Otp.deleteMany({ phone });
      return res.status(400).json({ status: 400, message: "OTP expired" });
    }

    if (otpDoc.attempts >= 5) {
      await Otp.deleteMany({ phone });
      return res.status(400).json({ status: 400, message: "Too many wrong attempts, request a new OTP" });
    }

    if (otpDoc.code !== code) {
      const updated = await Otp.findOneAndUpdate(
        { phone, attempts: otpDoc.attempts },
        { $inc: { attempts: 1 } },
        { new: true }
      );
      const attemptsLeft = Math.max(0, 5 - (updated ? updated.attempts : otpDoc.attempts + 1));
      if (updated && updated.attempts >= 5) {
        await Otp.deleteMany({ phone });
        return res.status(400).json({ status: 400, message: "Too many wrong attempts, request a new OTP" });
      }
      return res.status(400).json({ status: 400, message: "Invalid OTP", attemptsLeft });
    }

    await Otp.deleteMany({ phone });
    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ status: 404, message: "Phone number not registered" });

    const token = jwt.sign(
      { id: user._id, phone: user.phone },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    const isProd = process.env.NODE_ENV === "production";
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000
    });


    return res.status(200).json({ status: 200, message: "OTP verified successfully", token, user });
  } catch (err) {
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, email } = req.body;
    const user = await User.findByIdAndUpdate(userId, { firstName, lastName, email }, { new: true });
    return res.status(200).json({ status: 200, message: "Profile updated successfully", data: user });
  } catch (err) {
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};

export const sendEmailOtp = async (req, res) => {
  try {
    const userId = req.user.id;
    const { email } = req.body;
    if (!email) return res.status(400).json({ status: 400, message: "Email is required" });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const emailData = await EmailOtp.findOneAndUpdate(
      { userId, email },
      { code: otp, attempts: 0, createdAt: new Date() },
      { upsert: true, new: true }
    );

    // const client = new Sib.TransactionalEmailsApi();
    // client.setApiKey(
    //   Sib.TransactionalEmailsApiApiKeys.apiKey,
    //   process.env.BREVO_API_KEY.trim()
    // );

    // // send mail
    // await client.sendTransacEmail({
    //   sender: {
    //     email: process.env.BREVO_SENDER_EMAIL,
    //     name: process.env.BREVO_SENDER_NAME,
    //   },
    //   to: [{ email }],
    //   subject: "Your Email Verification OTP",
    //   htmlContent: `<h3>Your OTP Code is: <b>${otp}</b></h3><p>Valid for ${parseInt(process.env.OTP_EXPIRE_SECONDS || "300", 10) / 60
    //     } minutes.</p>`,
    // });
    // return res.json({
    //   success: true,
    //   message: "OTP sent successfully",
    // });
    return res.status(200).json({ status: 200, message: "OTP sent successfully", data: emailData.email });
  } catch (err) {
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};

export const verifyEmailOtp = async (req, res) => {
  try {
    const userId = req.user.id;
    const { email, code } = req.body;
    if (!email || !code)
      return res.status(400).json({ status: 400, message: "Email and code is required" });
    const otpDoc = await EmailOtp.findOne({ userId, email });

    if (!otpDoc) {
      return res.status(400).json({ status: 400, message: "OTP expired or invalid." });
    }

    if (otpDoc.attempts >= 5) {
      await EmailOtp.deleteMany({ userId });
      return res.status(400).json({ status: 400, message: "Too many attempts. Try again." });
    }

    if (otpDoc.code !== code) {
      otpDoc.attempts += 1;
      await otpDoc.save();
      if (otpDoc.attempts >= 5) {
        await EmailOtp.deleteMany({ userId });
        return res.status(400).json({ status: 400, message: "Too many attempts. Try again." });
      }
      return res.status(400).json({ status: 400, message: "Invalid OTP please check your valid OTP" });
    }

    const user = await User.findByIdAndUpdate(userId, { email }, { new: true });
    await EmailOtp.deleteMany({ userId });
    return res.status(200).json({ status: 200, message: "Email updated successfully", data: user });
  } catch (err) {
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};

export const logoutUser = (req, res) => {
  const isProd = process.env.NODE_ENV === "production";
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
  });
  res.status(200).json({ status: 200, message: "Logged out" });
};

// export const getUserData = async (req, res) => {
//   const token = req.cookies.token; if (!token) return res.json({ status: 401, message: "No token" });
//   const userId = req.user.id;
//   const user = await User.findById({ _id: userId });
//   res.status(200).json({ status: 200, user, token })
// }

export const getUserData = async (req, res) => {
  try {
    // 1️⃣ Read token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: 401,
        message: "No token",
      });
    }

    // 2️⃣ Extract token
    const token = authHeader.split(" ")[1];

    // 3️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ⚠️ YOUR TOKEN PAYLOAD USES `id`
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        status: 401,
        message: "User not found",
      });
    }

    // 4️⃣ RETURN SAME RESPONSE YOU WANT
    return res.status(200).json({
      status: 200,
      user,
      token, // ✅ INCLUDED
    });
  } catch (error) {
    return res.status(401).json({
      status: 401,
      message: "Invalid token",
    });
  }
};


export const getAllCardDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const cardsData = await Card.find({ userId: userId });
    if (!cardsData) {
      return res.status(404).json({ status: 404, message: "Cards not found!" });
    }
    return res.status(200).json({ status: 200, message: "Card details fetched successfully", data: cardsData });
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
}

export const getcarddetailsbyId = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cardId } = req.params;
    const cardsData = await Card.findOne({ _id: cardId, userId: userId });
    if (!cardsData) {
      return res.status(404).json({ status: 404, message: "Card not found!" });
    }
    return res.status(200).json({ status: 200, message: "Card details fetched successfully", data: cardsData });
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
}

export const addCardDetail = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cardHolderName, cardNumber, expiryDate, expiryYear, expiryMonth, cvvCode } = req.body;
    const cardDetails = await Card.find({ userId: userId });
    if (cardDetails.length >= 2) {
      return res.status(400).json({ status: 400, message: "You can store only 2 card details only!" });
    }
    if (!cardNumber || cardNumber.length < 4) {
      return res.status(400).json({ status: 400, message: "Invalid card number" });
    }
    const last4Digits = cardNumber.slice(-4);
    const existingCard = await Card.findOne({ userId: userId, last4Digits: last4Digits });
    if (existingCard) {
      return res.status(400).json({ status: 400, message: "Card already exists, please try another" });
    }
    const newCard = await Card.create({ userId, cardHolderName, last4Digits, expiryDate, expiryMonth, expiryYear, cvvCode });
    return res.status(201).json({ status: 201, message: "Card details saved successfully", data: newCard });
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
}

export const updateCardDetails = async (req, res) => {
  try {
    const { cardId } = req.params;
    const userId = req.user.id;
    const { cardHolderName, cardNumber, expiryDate, expiryYear, expiryMonth, cvvCode } = req.body;
    if (!cardNumber || cardNumber.length < 4) {
      return res.status(400).json({ status: 400, message: "Invalid card number" });
    }
    const last4Digits = cardNumber.slice(-4);
    const updateCard = await Card.findByIdAndUpdate(cardId, { userId, cardHolderName, last4Digits, expiryDate, expiryMonth, expiryYear, cvvCode }, { new: true });

    return res.status(200).json({ status: 200, message: "Card details updated successfully", data: updateCard });
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
}

export const deleteCardDetail = async (req, res) => {
  try {
    const { cardId } = req.params;
    await Card.findByIdAndDelete(cardId);
    return res.status(200).json({ status: 200, message: "Card details deleted successfully" });
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
}

