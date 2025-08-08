import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import { Clerk } from '@clerk/clerk-sdk-node';

// Initialize Clerk with the secret key
const clerkClient = Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

// @desc    Auth user with Clerk & get token
// @route   POST /api/users/clerk/auth
// @access  Public
const authUserWithClerk = asyncHandler(async (req, res) => {
  const { clerkId, firstName, lastName, email, role } = req.body;

  if (!clerkId || !email) {
    res.status(400);
    throw new Error('Invalid user data');
  }

  // Check if user exists in our database
  let user = await User.findOne({ email });

  // If user doesn't exist, create a new one
  if (!user) {
    user = await User.create({
      name: `${firstName || ''} ${lastName || ''}`.trim(),
      email,
      clerkId,
      role: role || 'student', // Default to student if role not provided
      // No password needed with Clerk authentication
    });
  } else if (!user.clerkId) {
    // If user exists but doesn't have a clerkId (e.g., they previously used password auth)
    user.clerkId = clerkId;
    await user.save();
  }

  if (user) {
    // Generate JWT token for our backend
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    // Set JWT as HTTP-Only cookie
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      clerkId: user.clerkId,
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or clerkId');
  }
});

// @desc    Verify Clerk session token
// @route   POST /api/users/clerk/verify
// @access  Public
const verifyClerkSession = asyncHandler(async (req, res) => {
  const { sessionToken } = req.body;

  if (!sessionToken) {
    res.status(400);
    throw new Error('Session token is required');
  }

  try {
    // Verify the session token with Clerk
    const session = await clerkClient.sessions.verifySession({
      sessionId: sessionToken,
      status: 'active',
    });

    if (session) {
      // Get the user from Clerk
      const clerkUser = await clerkClient.users.getUser(session.userId);
      
      // Find or create user in our database
      let user = await User.findOne({ clerkId: clerkUser.id });
      
      if (!user) {
        // Get primary email
        const primaryEmail = clerkUser.emailAddresses.find(
          email => email.id === clerkUser.primaryEmailAddressId
        )?.emailAddress;

        if (!primaryEmail) {
          res.status(400);
          throw new Error('Email address is required');
        }

        // Create new user
        user = await User.create({
          name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
          email: primaryEmail,
          clerkId: clerkUser.id,
          role: req.body.role || 'student', // Get role from request or default to student
        });
      }

      // Generate JWT token for our backend
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
      });

      // Set JWT as HTTP-Only cookie
      res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        clerkId: user.clerkId,
      });
    } else {
      res.status(401);
      throw new Error('Invalid session token');
    }
  } catch (error) {
    res.status(401);
    throw new Error(`Session verification failed: ${error.message}`);
  }
});

export { authUserWithClerk, verifyClerkSession };
