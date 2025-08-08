import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import { Clerk } from '@clerk/clerk-sdk-node';

const protect = asyncHandler(async (req, res, next) => {
  // Check for JWT in cookies (our traditional auth)
  let token = req.cookies.jwt;

  // Check for Clerk session token in headers
  const clerkSessionToken = req.headers['clerk-session-token'];

  // JWT cookie present
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // Get user from database (excluding password)
      req.user = await User.findById(decoded.userId).select("-password");
      
      if (!req.user) {
        res.status(401);
        throw new Error("User not found");
      }
      
      next();
    } catch{
      // If JWT verification fails, try Clerk token
      if (clerkSessionToken) {
        try {
          // Initialize Clerk client
          const clerkClient = Clerk({ secretKey: process.env.CLERK_SECRET_KEY });
          
          // Verify the session token with Clerk
          const session = await clerkClient.sessions.verifySession({
            sessionId: clerkSessionToken,
            status: 'active',
          });
          
          if (session) {
            // Find user by clerkId
            const user = await User.findOne({ clerkId: session.userId }).select("-password");
            
            if (!user) {
              res.status(401);
              throw new Error("User not found in database");
            }
            
            // Set user in request
            req.user = user;
            next();
            return;
          }
        } catch (clerkError) {
          console.error('Clerk authentication error:', clerkError);
          res.status(401);
          throw new Error("Not Authorized, Invalid Clerk Token");
        }
      } else {
        res.status(401);
        throw new Error("Not Authorized, Invalid Token");
      }
    }
  } 
  // No JWT token, but Clerk token present
  else if (clerkSessionToken) {
    try {
      // Initialize Clerk client
      const clerkClient = Clerk({ secretKey: process.env.CLERK_SECRET_KEY });
      
      // Verify the session token with Clerk
      const session = await clerkClient.sessions.verifySession({
        sessionId: clerkSessionToken,
        status: 'active',
      });
      
      if (session) {
        // Find user by clerkId
        const user = await User.findOne({ clerkId: session.userId }).select("-password");
        
        if (!user) {
          res.status(401);
          throw new Error("User not found in database");
        }
        
        // Set user in request
        req.user = user;
        next();
        return;
      }
    } catch (error) {
      console.error('Clerk authentication error:', error);
      res.status(401);
      throw new Error("Not Authorized, Invalid Clerk Token");
    }
  } 
  // No tokens present
  else {
    res.status(401);
    throw new Error("Not Authorized, no Token");
  }
});

export { protect };
