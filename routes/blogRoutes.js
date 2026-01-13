import express from "express";
import { upload } from "../utils/multer.js";
import {createBlog,deleteBlog,getAllBlogs,getBlogById,updateBlog,} from "../controllers/blogController.js";

const router = express.Router();

router.post("/addblog",upload.fields([{ name: "image", maxCount: 1 },{ name: "childImages", maxCount: 5 },]),createBlog);
router.get("/getallblogs", getAllBlogs);
router.get("/getblogdetails/:id", getBlogById);

router.put("/updateblog/:id",upload.fields([{ name: "image", maxCount: 1 },{ name: "childImages", maxCount: 5 },]),updateBlog);

router.delete("/deleteblog/:id", deleteBlog);

export default router;
