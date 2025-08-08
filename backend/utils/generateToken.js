import jwt from "jsonwebtoken";

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "none", // Changed from 'strict' to 'none' to allow cross-site requests
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
  return token
};

export default generateToken;
