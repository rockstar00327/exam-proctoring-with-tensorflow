import asyncHandler from "express-async-handler";
import User from "./../models/userModel.js";
import generateToken from "../utils/generateToken.js";

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    const token = generateToken(res, user._id);

    res.status(201).json({
      success: true,
      token: token,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      password_encrypted: user.password,
      message: "User Successfully login with role: " + user.role,
    });
  } else {
    res.json({
      success: false,
      message: "Invalid User email or password"
    })
    // res.status(401);
    // throw new Error("Invalid User email or password ");
  }
});

const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;
  console.log(`${firstName}, ${lastName}, ${email}, ${role} Registering...`)
  const userExist = await User.findOne({ email });

  if (userExist) {
    console.log('User already exists!')
    res.json({
      success: false,
      message: 'User already exists!'
    });
    // throw new Error("User Already Exists");
  }

  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    role,
  });

  if (user) {
    generateToken(res, user._id);
    console.log(`User successufully created with role: ${user.role}`)
    res.status(201).json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      password_encrypted: user.password,
      message: "User Successfully created with role: " + user.role,
    });
  } else {
    res.status(400);
    // throw new Error("Invalid User Data");
  }
});

const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: " User logout User" });
});

const getUserProfile = asyncHandler(async (req, res) => {
  const user = {
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
  };
  res.status(200).json(user);
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } else {
    res.status(404);
    throw new Error("User Not Found");
  }
});
export {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
};
