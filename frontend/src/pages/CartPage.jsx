import React from "react";
import { useCartStore } from "../stores/useCartStore";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import CartItem from "../components/CartItem";
import PeopleAlsoBought from "../components/PeopleAlsoBought";
import OrderSummary from "../components/OrderSummary";
import GiftCouponCart from "../components/GiftCouponCart";

const CartPage = () => {
  const { cart } = useCartStore();
  return (
    <div className="py-8 md:py-16">
      <div className="mx-auto max-w-screen-xl px-4 2xl:p-0 ">
        <div className="mt-6 sm:mt-8 lg:flex md:gap-6 lg:gap-8 lg:items-start ">
          <motion.div
            className="mx-auto w-full flex-none space-y-4 lg:max-w-2xl xl:max-w-4xl"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {cart.length === 0 ? (
              <EmptyCartUI />
            ) : (
              cart.map((item) => (
                <div className="space-y-8" key={item._id}>
                  <CartItem item={item} />
                </div>
              ))
            )}
            {cart.length > 0 && <PeopleAlsoBought />}
          </motion.div>

          {cart.length > 0 && (
            <motion.div
              className="mx-auto mt-6 max-w-4xl flex-1 space-y-6 lg:mt-0 lg:w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <OrderSummary />
              <GiftCouponCart />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

const EmptyCartUI = () => {
  return (
    <motion.div>
      <ShoppingCart className="h-24 w-24 text-gray-300" />
      <h3 className="text-2xl font-semibold">Your cart is Empty</h3>
      <p className="text-gray-400">Looks like you have't added anything to your cart yet.</p>
      <Link to="/" className="mt-4 rounded-md bg-emerald-500 px-6 py-3 text-white transition-colors hover:bg-emerald-600">
        Start Shopping
      </Link>
    </motion.div>
  );
};

export default CartPage;
