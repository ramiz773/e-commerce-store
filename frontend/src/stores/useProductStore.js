import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios.js";

export const useProductStore = create((set) => ({
  products: [],
  loading: false,
  featuredProducts: [],

  setProducts: (products) => {
    set({ products });
  },

  createProduct: async (productData) => {
    set({ loading: true });
    try {
      const res = await axios.post("/products", productData);
      console.log(res.data);
      set((prevState) => ({
        products: [...prevState.products, res.data],
        loading: false,
      }));
    } catch (error) {
      set({ loading: false });
      console.log(error);
      toast.error(error.response.data.error);
    }
  },

  fetchAllProducts: async () => {
    set({ loading: true });
    try {
      const res = await axios.get("/products");
      set({ products: res.data.products, loading: false });
    } catch (error) {
      set({ error: "faild to fetch products", loading: false });
      toast.error(error.response.data.error || "Failed to fetch products");
    }
  },

  deleteProduct: async (id) => {
    set({ loading: true });

    try {
      await axios.delete(`/products/${id}`);
      set((prevState) => ({
        products: prevState.products.filter((product) => product._id !== id),
        loading: false,
      }));
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.error || "failed to delete product");
    }
  },

  toggleFeaturedProduct: async (id) => {
    set({ loading: true });
    try {
      const response = await axios.patch(`/products/${id}`);
      //    this will update the isFeatured property in our state
      set((prevState) => ({
        products: prevState.products.map((product) => (product._id === id ? { ...product, isFeatured: response.data.isFeatured } : product)),
        loading: false,
      }));
    } catch (error) {
      set({ loading: false });
      toast.error(error.response.data.error | " Failed to update isFeatured product");
      console.log(error);
    }
  },

  fetchProductsByCategory: async (category) => {
    set({ loading: true });
    try {
      const response = await axios.get(`/products/category/${category}`);
      set({ products: response.data.products, loading: false });
    } catch (error) {
      set({ error: "failed to fetch products", loading: false });
      console.log(error);
      toast.error(error.response.data.error || "Could not fetch by products by category");
    }
  },

  // setFeaturedProducts: async () => {
  //   set({ loading: true });
  //   try {
  //     const res = await axios.get("/products/featured");
  //     console.log(res.data);
  //     set({ products: response.data, loading: false });
  //   } catch (error) {
  //     console.log(error);
  //     set({ error: "Failed to fetch products", loading: false });
  //   }
  // },
}));
