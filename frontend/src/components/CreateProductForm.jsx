import React, { useState } from "react";
import { motion } from "framer-motion";
import { Loader, PlusCircle, Upload } from "lucide-react";
import { useProductStore } from "../stores/useProductStore";

const categories = ["jeans", "t-shirts", "shoes", "glasses", "jackets", "suits", "bags"];

const CreateProductForm = () => {
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
  });

  const { createProduct, loading } = useProductStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createProduct(newProduct);
      setNewProduct({
        name: "",
        description: "",
        price: "",
        category: "",
        image: "",
      });
    } catch (error) {
      console.log("error in create product in createProductForm.jsx", error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct({ ...newProduct, image: reader.result });
      };

      reader.readAsDataURL(file); // base64 encoding
    }
  };

  return (
    <motion.div
      className="bg-gray-800 shadow-lg rounded-lg p-8 mb-8 max-w-xl mx-auto"
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.8 }}
    >
      <h2 className="text-2xl font-semibold mb-6 text-emerald-300">Create New Product</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300">
            Product name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-md py-2 px-3
           text-white focus:ring-1 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300">
            Product Description
          </label>
          <textarea
            id="description"
            name="description"
            value={newProduct.description}
            rows={3}
            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-md py-2 px-3
           text-white focus:ring-1 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-300">
            Product Price
          </label>
          <input
            type="Number"
            id="price"
            name="price"
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-md py-2 px-3
           text-white focus:ring-1 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-300">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={newProduct.category}
            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-md py-2 px-3
           text-white focus:ring-1 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">Select a Category</option>
            {categories?.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className="mt-1 flex items-center">
          <input type="file" id="image" className="sr-only" accept="image/*" onChange={handleImageChange} />
          <label
            htmlFor="image"
            className="cursor-pointer bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3
           text-sm leading-4 font-medium text-gray-300 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            <Upload className="-h-4 w-4 inline-block mr-2" />
            Upload Image
          </label>
          {newProduct.image && <span className="ml-3 text-sm text-gray-400">image uploaded</span>}
        </div>

        <button
          type="submit"
          className="w-full mt-5 flex justify-center py-2 px-4 border border-transparent 
        rounded-md text-sm font-medium text-white  bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus-ring-2 focus:ring-offset-2
         focus:ring-emerald-500 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
              Loading....
            </>
          ) : (
            <>
              <PlusCircle className="mr-2 w-5 h-5" />
              Create Product
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
};

export default CreateProductForm;
