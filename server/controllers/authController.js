import jwt from 'jsonwebtoken';
import crypto from "crypto";
import User from "../models/userModel.js";
import {
  generateAccessToken,
  generateRefreshToken
} from "../utils/generateToken.js";
import sendEmail from "../utils/sendEmail.js";
import cookieOptions from "../utils/cookieOptions.js";

// REGISTER + AUTO LOGIN
export const register = async (req, res) => {
  try {
    const { fullname, username, email, password } = req.body;

    if(!fullname || !username || !email || !password){
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const existsUsername = await User.findOne({ username });
    if (existsUsername) {
      return res.status(400).json({ message: "Username already taken" });
    }
    const existsEmail = await User.findOne({ email });
    if (existsEmail) {
      return res.status(400).json({ message: "Email already exist" });
    }

    const user = await User.create({
      fullname,
      username,
      email,
      password
    });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    await sendEmail({
      to: user.email,
      subject: "Welcome to Instaio",
      html: `
        <h2>Welcome, ${user.fullname}!</h2>
        <p>Your account has been created successfully.</p>
        <p>Username: <strong>@${user.username}</strong></p>
        <p>We’re happy to have you with us.</p>
      `
    });

    res
      .status(201)
      .cookie("accessToken", accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000
      })
      .cookie("refreshToken", refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000
      })
      .json({
        message: "User registered successfully",
        user
      });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!password || !identifier) {
      return res.status(400).json({ message: "Please provide credentials" });
    }

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);

    const query = isEmail ? { email: identifier } : { username: identifier };

    const user = await User.findOne(query).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    user.password = undefined;
    user.refreshToken = undefined;

    res
      .cookie("accessToken", accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000
      })
      .cookie("refreshToken", refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000
      })
      .json({
        message: "Logged in successfully",
        user
      });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// REFRESH TOKEN
export const refreshToken = async (req, res) => {
  const refreshTokenCookie = req.cookies?.refreshToken;
  if (!refreshTokenCookie) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(
      refreshTokenCookie,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decoded.userId);
    if (!user || !user.refreshToken) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const isValid = user?.refreshToken.toString() === refreshTokenCookie.toString();

    if (!isValid) {
      user.refreshToken = null;
      await user.save();

      res.clearCookie("accessToken", cookieOptions);
      res.clearCookie("refreshToken", cookieOptions);

      return res.status(403).json({ message: "Token reuse detected" });
    }

    // Rotate tokens
    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save();

    const userData = await User.findById(user._id)
      .select("-password -refreshToken -resetToken -resetTokenExpiration");
    
    res.cookie("accessToken", newAccessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000 
    })
    .cookie("refreshToken", newRefreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000 
    })
    .json({
      message: "Token refreshed",
      user: userData
    });

  } catch (error) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
};

// LOGOUT
export const logout = async (req, res) => {
  try {
    if (req.user) {
      req.user.refreshToken = null;
      await req.user.save();
    }

    res.clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .status(200)
    .json({ message: "Logged out" });
  } catch (err) {
    res.status(500).json({ message: "Logout failed" });
  }
};

// FORGOT PASSWORD
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Email not registered. Please provide your registered email."
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token before saving
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetToken = hashedToken;
    user.resetTokenExpiration = Date.now() + 15 * 60 * 1000;
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: "Reset your password",
      html: `
        <p>Hi ${user.username},</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link expires in 15 minutes.</p>
      `
    });

    res.status(200).json({
      message: "Password reset link sent. Please check your email."
    });

  } catch (err) {
    res.status(500).json({ message: "Failed to send reset link" });
  }
};

// RESET PASSWORD
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword, confirmPassword } = req.body;

    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "Invalid request"
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match"
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters"
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpiration: { $gt: Date.now() }
    }).select("+password");

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired reset token"
      });
    }

    const isSame = await user.matchPassword(newPassword);
    if (isSame) {
      return res.status(400).json({
        message: "New password must be different from old password"
      });
    }

    user.password = newPassword; 
    user.resetToken = null;
    user.resetTokenExpiration = null;
    user.refreshToken = null; 

    await user.save();

    res.status(200).json({
      message: "Password reset successful. Please login again."
    });

  } catch (err) {
    res.status(500).json({ message: "Password reset failed" });
  }
};
