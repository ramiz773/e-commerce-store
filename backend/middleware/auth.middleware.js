import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
   try {
      const accessToken = req.cookies.accessToken;
      console.log(accessToken);
      if (!accessToken) {
         return res
            .status(401)
            .json({ message: "Unauthorized - No access token provider" });
      }

      try {
         const decode = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
         const user = await User.findById(decode.userId).select("-password");

         if (!user) {
            return res.status(401).json({ message: "User not found" });
         }

         req.user = user;
         next();
      } catch (error) {
         console.log(`Error in nested trycatch in auth-middleware ${error.message}`);
         if (error.name === "TokenExpiredError") {
            return res
               .status(401)
               .json({ message: "Unauthorized - access token expired" });
         }
         throw error;
      }
   } catch (error) {
      console.log(`Error in auth.middleware : ${error.message}`);
      return res
         .status(401)
         .json({ message: "Unauthorized - Invalid access token" });
   }
};

export const adminRoute = (req, res, next) => {
   if (req.user && req.user.role === "admin") {
      next();
   } else {
      return res.status(403).json({ message: "Access denied - Admin-only" });
   }
};
