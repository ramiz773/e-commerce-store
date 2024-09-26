import Product from "../models/product.model.js";
import { redis } from "../lib/redis.js";
import cloudinary from "../lib/cloudinary.js";

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({}); //  return all product
    res.json({ products });
  } catch (error) {
    console.log(`Error in get all product controller : ${error.message}`);
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    let featuredProducts = await redis.get("featured_products");
    if (featuredProducts) {
      return res.json(JSON.parse(featuredProducts));
    }

    //   if not in redis, fetch from mongodb
    //   lean is gonna return a plain javascirpt object instead of mogoose object
    //   resulting in faster queries, especially when you don’t need to modify or save the returned documents.
    featuredProducts = await Product.find({ isFeatured: true }).lean();
    if (!featuredProducts) {
      return res.status(404).json({ message: "No featured products found" });
    }

    //   store in redis for feature quick access
    await redis.set("featured_product", JSON.stringify(featuredProducts));
    res.json(featuredProducts);
  } catch (error) {
    console.log(`Error in getFreaturedProduct ${error.message}`);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, image, category } = req.body;
    let cloudinaryResponse = null;
    if (image) {
      cloudinaryResponse = await cloudinary.uploader.upload(image, {
        folder: "products",
      });
    }

    const product = await Product.create({
      name,
      description,
      price,
      image: cloudinaryResponse?.secure_url
        ? cloudinaryResponse.secure_url
        : "",
      category,
    });
    res.status(201).json(product);
  } catch (error) {}
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.image) {
      const productId = product.image.split("/").pop().split(".")[0]; // this will get the image id
      try {
        await cloudinary.uploader.destroy(`products/${productId}`);
        console.log("deleted image from cloudinary");
      } catch (error) {
        console.log(`delete image from cloudinary ${error.message}`);
      }
    }

    await Product.findByIdAndDelete(id);
    console.log("product deleted from mongodb");
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.log("Error in product delete contorller ", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getRecommendedProducts = async (req, res) => {
  try {
    const product = await Product.aggregate([
      { $sample: { size: 3 } },
      {
        $product: {
          _id: 1,
          name: 1,
          description: 1,
          image: 1,
          price: 1,
        },
      },
    ]);
    res.json(product);
  } catch (error) {
    console.log(`Error in get reconmmendation controller : ${error.message}`);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getProductsByCategory = async (req, res) => {
  const { category } = req.params;
  console.log(category);
  try {
    const products = await Product.find({ category });
    console.log(products);
    res.json({ products });
  } catch (error) {
    console.log(`Error in get product category controller : ${error.message}`);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const toggleFeaturedProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    if (product) {
      product.isFeatured = !product.isFeatured;
      const updatedProduct = await product.save();
      // update redis
      await updateFeaturedProductCache();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.log(
      `Error in toggle featured product controller : ${error.message}`
    );
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

async function updateFeaturedProductCache() {
  try {
    const featuredProducts = await Product.find({ isFeatured: true }).lean();
    await redis.set("featured_product", JSON.stringify(featuredProducts));
  } catch (error) {
    console.log(`error in update cache function : ${error.message}`);
  }
}
