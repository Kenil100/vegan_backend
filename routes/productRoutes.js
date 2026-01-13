import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { upload } from "../utils/multer.js";

import {
  updateProduct,
  deleteProduct,
  getProducts,
  getProductById,
  addReview,
  addProduct,
} from "../controllers/productController.js";

const router = express.Router();

router.post('/addreview',addReview)
router.get("/getallproducts", getProducts);
router.get("/getproductdetails/:id", getProductById);

router.post("/addproduct",verifyToken,upload.array("images", 5),addProduct);
router.put("/updateproduct/:id",verifyToken,upload.array("images", 5),updateProduct);

router.delete("/deleteproduct/:id",deleteProduct);

export default router;
