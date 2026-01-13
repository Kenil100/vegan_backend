import Product from "../models/Product.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import cloudinary from "../config/cloudinary.js";
import { uploadToCloudinary1 } from "../utils/cloudinaryUpload.js";

export const addProduct = async (req, res) => {
  try {
     const userId=req.user.id;
    const { name, category, description, quantity } = req.body;
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ status:400,message: "At least 1 image required" });
    }
    if (req.files.length > 4) {
      return res.status(400).json({ status:400,message: "Maximum 4 images allowed" });
    }
     const images = [];
     for (const file of req.files) {
      const result = await uploadToCloudinary1(file.buffer,"veganFood/product");
      images.push({
        url: result.secure_url,
        public_id: result.public_id,
      });
    }
    const product = await Product.create({
      name,
      category,
      description,
      images,
      quantity,
      variants: JSON.parse(req.body.variants),
      additionalInfo: JSON.parse(req.body.additionalInfo),
      createdBy: userId
    });

    return res.status(201).json({ status: 201, message: "Product added successfully", data: product });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};

export const updateProduct = async (req, res) => {
  try {
     const userId=req.user.id;
     const productId = req.params.id;
     const { name, category, description, quantity } = req.body;
      if (!name || !category || !description || !quantity) {
      return res.status(400).json({ status: 400, message: "Required all fields!" });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ status:400,message: "At least 1 image required" });
    }
    if (req.files.length > 4) {
      return res.status(400).json({ status:400,message: "Maximum 4 images allowed" });
    }
    const product = await Product.findById(productId);
    if (!product) { res.status(404).json({ status: 404, message: "Product not found" }); }

    const exists = await Product.findOne({ name });
    if (exists) {
      return res.status(400).json({ status: 400, message: "Product name already exists. Please choose a different name." });
    }

    for (const img of product.images) {
      if (img.public_id) {
        await cloudinary.uploader.destroy(img.public_id);
      }
    }

    const images = [];
     for (const file of req.files) {
      const result = await uploadToCloudinary1(file.buffer,"veganFood/product");
      images.push({
        url: result.secure_url,
        public_id: result.public_id,
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        name: name,
        category: category,
        description: description,
        quantity:quantity,
        images: images,
        variants: JSON.parse(req.body.variants),
        additionalInfo: JSON.parse(req.body.additionalInfo),
        createdBy: userId
      },
      { new: true }
    );

     return res.status(200).json({ status: 200, message: "Product updated successfully",data:updatedProduct});
  } catch (err) {
    console.log(err);
   return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (!product) { res.status(404).json({ status: 404, message: "Product not found" }); }

    for (const img of product.images) {
      if (img.public_id) {
        await cloudinary.uploader.destroy(img.public_id);
      }
    }

    await Product.findByIdAndDelete(productId);
    return res.status(200).json({ status: 200, message: "Product deleted successfully"});
  } catch (err) {
   return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().select("name price category images rating variants description quantity createdAt").sort({ createdAt: -1 });
    return res.status(200).json({ status: 200, message: "Products fetched successfully", data: products });
  } catch (err) {
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};

export const getProductById = async (req, res) => {
  try {
    const productDetails = await Product.findById(req.params.id);

    if (!productDetails) { res.status(404).json({ status: 404, message: "Product not found" }); }

    const relatedProductsData = await Product.find({ category: productDetails.category, _id: { $ne: productDetails._id } }).limit(10);


    const reviews = productDetails.reviews || [];
    const totalReviews = reviews.length;
    const totalRatings = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalReviews > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews : 0;

    productDetails.rating = Number(averageRating.toFixed(1));
    productDetails.totalRatings = totalRatings;

    await productDetails.save();

    return res.status(200).json({ status: 200, message: "Product details fetched successfully", productDetails, relatedProductsData });
  } catch (err) {
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};

export const addReview = async (req, res) => {
  try {
    const { productId, userId, userName, rating, title, comment } = req.body;
    const product = await Product.findById(productId);
    const alreadyReviewed = product.reviews.find((r) => r.userId?.toString() === userId);
    if (alreadyReviewed) {
      return res.status(400).json({ status: 400, message: "You have already reviewed this product" });
    }
    const review = { userId, userName, rating: rating, title, comment };
    product.reviews.push(review);
    product.totalRatings = product.reviews.length;
    product.rating = product.reviews.reduce((acc, r) => acc + r.rating, 0) /
    product.totalRatings;
    await product.save();

    return res.status(200).json({ status: 200, message: "Review added successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
}
