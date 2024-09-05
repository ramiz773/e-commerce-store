import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { redis } from "../lib/redis.js";

const generateTokens = (userId) => {
   const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "15m",
   });
   const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: "7d",
   });
   return { accessToken, refreshToken };
};

const storeRefreshTokens = async (userId, refreshToken) => {
   await redis.set(`refresh_token${userId}`, refreshToken, "EX", 7 * 24 * 60 * 60);
};

const setCookies = (res, accessToken, refreshToken) => {
   res.cookie("accessToken", accessToken, {
      httpOnly: true, // prevent xss attacks,
      secure: process.env.NODE_ENV === "production",
      sameSites: "strict", // prevent csrf attack, cross site request forgery attack
      maxAge: 15 * 60 * 1000, // 15 minutes
   });

   res.cookie("refreshToken", refreshToken, {
      httpOnly: true, // prevent xss attacks,
      secure: process.env.NODE_ENV === "production",
      sameSites: "strict", // prevent csrf attack, cross site request forgery attack
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
   });
};

export const signup = async (req, res) => {
   try {
      const { name, email, password } = req.body;
      const userExist = await User.findOne({ email });
      if (userExist) {
         return res.status(400).json({ message: "User already exists" });
      }
      const user = await User.create({ name, email, password });

      //  authenticate
      const { accessToken, refreshToken } = generateTokens(user._id);
      await storeRefreshTokens(user._id, refreshToken);
      setCookies(res, accessToken, refreshToken);

      res.status(201).json({
         user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
         },
         message: "User created successfully",
      });
   } catch (error) {
      console.log(`Error in sign up Controller : ${error.message}`);
      res.status(500).json({ message: error.message });
   }
};

export const login = async (req, res) => {
   try {
      const { email, password } = req.body;
      console.log(email, password);
      const user = await User.findOne({ email });
      console.log(user);
      if (user && (await user.comparePassword(password))) {
         const { accessToken, refreshToken } = generateTokens(user._id);
         await storeRefreshTokens(user._id, refreshToken);
         setCookies(res, accessToken, refreshToken);
         res.json({
            user: {
               id: user._id,
               name: user.name,
               email: user.email,
               role: user.role,
            },
            message: "user login successfully",
         });
      } else {
         res.status(400).json({ message: "invalid  email or password" });
      }
   } catch (error) {
      console.log("Error in login controller : ", error.message);
      res.status(500).json({ message: error.message });
   }
};

export const logout = async (req, res) => {
   try {
      const refreshToken = req.cookies.refreshToken;
      if (refreshToken) {
         const decode = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
         console.log("auth contorller line No 74 :", decode);
         await redis.del(`refresh_token${decode.userId}`);
      }
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      res.json({ message: "logged out successfully" });
   } catch (error) {
      console.log(`Error in logout controller : ${error.message}`);
      res.status(500).json({ message: "Internal Server error" });
   }
};

//  this is will refresh access token
export const refreshToken = async (req, res) => {
   try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
         return res.json({ message: "No refresh token not provided" });
      }
      const decode = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      console.log(decode);
      const storedToken = await redis.get(`refresh_token${decode.userId}`);
      if (storedToken !== refreshToken) {
         return res.status(401).json({ message: "Invalid refresh token" });
      }
      const accessToken = jwt.sign(
         { userId: decode.userId },
         process.env.ACCESS_TOKEN_SECRET,
         {
            expiresIn: "15m",
         }
      );
      res.cookie("accessToken", accessToken, {
         httpOnly: true,
         secure: process.env.NODE_ENV === "production",
         sameSites: "strict",
         maxAge: 15 * 60 * 1000,
      });
      res.json({ message: "token refreshed successfully" });
   } catch (error) {
      console.log(`Error in refresh acces token controller : ${error.message}`);
      res.status(500).json({ message: "Server error", error: error.message });
   }
};

export const getProfile = async (req, res) => {
   //    try {
   //       const
   //    } catch (error) {
   //    }
};
