import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useCartStore = create((set, get) => ({
  cart: [],
  coupon: null,
  total: 0,
  subtotal: 0,
  loading: false,

  getCartItems: async () => {
    set({ loading: true });
    try {
      const response = await axios.get("/cart");
      set({ cart: response.data, loading: false });
      get().calculateTotals();
    } catch (error) {
      set({ cart: [], loading: false });
      toast.error(error.response.data.error || "failed to fetch cart items ");
    }
  },

  addToCart: async (product) => {
    set({ loading: true });
    try {
      await axios.post("/cart", { productId: product._id });
      set((prevState) => {
        const existingItem = prevState?.cart.find((cartItem) => cartItem._id === product._id);
        const newCart = existingItem
          ? prevState?.cart.map((item) => (item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item))
          : [...prevState.cart, { ...product, quantity: 1 }];
        return { cart: newCart, loading: false };
      });
      get().calculateTotals();
    } catch (error) {
      console.log("error in added to cart useCartStore : ", error);
      toast.error("An error occured");
    }
  },

  calculateTotals: () => {
    const { cart, coupon } = get();

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantiry, 0);
    let total = subtotal;

    if (coupon) {
      const discount = subtotal * (coupon.discountPercentage / 100);
      total = subtotal - discount;
    }

    set({ subtotal, total });
  },
}));
