import Blog from "../models/Blog.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import cloudinary from "../config/cloudinary.js";
import { uploadToCloudinary1 } from "../utils/cloudinaryUpload.js";

export const createBlog = async (req, res) => {
  try {
    const { title, description, otherDescription, createdByName, type } = req.body;
    let mainImageUrl = "";
    let mainImageId = "";
    if(req.files?.image?.length>1)
    {
       return res.status(400).json({ status:400,message: "Only 1 images allowed" });
    }
     if(req.files?.childImages?.length>4)
    {
       return res.status(400).json({ status:400,message: "Maximum 4 images allowed" });
    }
    if (req.files?.image?.length > 0) {
      const result = await uploadToCloudinary1(req.files.image[0].buffer, "veganFood/blogs");
      mainImageUrl = result.secure_url;
      mainImageId = result.public_id;
    }
    const children = JSON.parse(req.body.children || "[]");
    if (req.files?.childImages) {
      for (let i = 0; i < children.length; i++) {
        if (req.files.childImages[i]) {
          const result = await uploadToCloudinary1(req.files.childImages[i].buffer, "veganFood/blogs/children");
          children[i].image = result.secure_url;
          children[i].imageId = result.public_id;
        }
      }
    }

    const blogData = await Blog.create({
      title,
      image: mainImageUrl,
      imageId: mainImageId,
      description,
      otherDescription,
      createdByName,
      type,
      children
    });

    return res.status(201).json({ status: 201, message: "Blog created successfully", data: blogData });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};

export const updateBlog = async (req, res) => {
  try {
    const blogId = req.params.id;
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ status: 404, message: "Blog not found!" });
    }
     const { title, description, otherDescription, createdByName, type } = req.body;
    console.log(title, description, otherDescription, createdByName, type);
    console.log(req.files?.childImages.length);
    if(req.files?.image?.length>1)
    {
       return res.status(400).json({ status:400,message: "Only 1 images allowed" });
    }
    if(req.files?.childImages.length>4)
    {
       return res.status(400).json({ status:400,message: "Maximum 4 images allowed" });
    }
    if (blog.imageId) {
      await cloudinary.uploader.destroy(blog.imageId);
    }

     if (blog.children && blog.children.length > 0) {
      const deletePromises = blog.children.filter(child => child.imageId).map(child => cloudinary.uploader.destroy(child.imageId));
      await Promise.all(deletePromises);
    }

    let mainImageUrl = "";
    let mainImageId = "";
    if (req.files?.image?.length > 0) {
      const result = await uploadToCloudinary1(req.files.image[0].buffer, "veganFood/blogs");
      mainImageUrl = result.secure_url;
      mainImageId = result.public_id;
    }

     const children = JSON.parse(req.body.children || "[]");
    if (req.files?.childImages) {
      for (let i = 0; i < children.length; i++) {
        if (req.files.childImages[i]) {
          const result = await uploadToCloudinary1(req.files.childImages[i].buffer, "veganFood/blogs/children");
          children[i].image = result.secure_url;
          children[i].imageId = result.public_id;
        }
      }
    }

    blog.title = title;
    blog.image = mainImageUrl;
    blog.imageId = mainImageId;
    blog.description = description;
    blog.otherDescription = otherDescription;
    blog.createdByName = createdByName;
    blog.type = type;
    blog.children = children;
    await blog.save();

    return res.status(200).json({ status: 200, message: "Blog updated successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};

export const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    return res.status(200).json({ status: 200, message: "Blogs fetched successfully", data: blogs });
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};

export const getBlogById = async (req, res) => {
  try {
    const blogId = req.params.id;
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ status: 404, message: "Blog not found!" });
    }
    return res.status(200).json({ status: 200, message: "Blog details fetched successfully", data: blog });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};

export const deleteBlog = async (req, res) => {
  try {
    const blogId = req.params.id;
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ status: 404, message: "Blog not found!" });
    }

    if (blog.imageId) {
      await cloudinary.uploader.destroy(blog.imageId);
    }
    if (blog.children && blog.children.length > 0) {
      const deletePromises = blog.children.filter(child => child.imageId).map(child => cloudinary.uploader.destroy(child.imageId));
      await Promise.all(deletePromises);
    }

    await Blog.findByIdAndDelete(blogId);
    return res.status(200).json({ status: 200, message: "Blog deleted successfully" });
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
}
