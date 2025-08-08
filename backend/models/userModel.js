import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      require: true,
    },

    lastName: {
      type: String,
      require: true,
    },

    email: {
      type: String,
      require: true,
      unique: true,
    },

    password: {
      type: String,
      required: false, // Will be optional for Clerk auth
    },
    role: {
      type: String,
      require: true,
    },
    clerkId: {
      type: String,
      unique: true,
      sparse: true, // Allows null values and maintains uniqueness for non-null values
    },
    profilePicture: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);
// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  // For users without a password (using Clerk)
  if (!this.password) {
    return false;
  }
  // For users with password
  return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password using bcrypt
userSchema.pre("save", async function (next) {
  // if this user obj is not modified mode next
  // else if user obj is create or modified like during update then hash password
  if (!this.isModified("password") || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model("User", userSchema);

export default User;
