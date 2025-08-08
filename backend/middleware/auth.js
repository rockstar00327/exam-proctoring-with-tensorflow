import { verifyJwtToken } from '../utils/jwt.js';
import User from '../models/userModel.js';
import { errorResponse } from '../utils/apiResponse.js';

/**
 * Middleware to protect routes that require authentication
 */
const protect = async (req, res, next) => {
  try {
    // 1) Get token and check if it exists
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return errorResponse(
        res,
        401,
        'You are not logged in! Please log in to get access.'
      );
    }

    // 2) Verify token
    const decoded = await verifyJwtToken(token);

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return errorResponse(
        res,
        401,
        'The user belonging to this token no longer exists.'
      );
    }

    // 4) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return errorResponse(
        res,
        401,
        'User recently changed password! Please log in again.'
      );
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to restrict routes to specific roles
 * @param {...string} roles - Allowed roles
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res,
        403,
        'You do not have permission to perform this action'
      );
    }
    next();
  };
};

export {
  protect,
  restrictTo,
};
