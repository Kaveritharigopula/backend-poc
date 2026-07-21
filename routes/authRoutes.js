const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const authMiddleware = require(
  "../middleware/authMiddleware"
);

const roleMiddleware = require(
  "../middleware/roleMiddleware"
);

const router = express.Router();

//
// REGISTER
//
router.post(
  "/register",
  async (req, res) => {
    try {
      const {
        name,
        email,
        password,
        role
      } = req.body;

      const existingUser =
        await User.findOne({
          email
        });

      if (existingUser) {
        return res.status(400).json({
          message:
            "User already exists"
        });
      }

      const hashedPassword =
        await bcrypt.hash(
          password,
          10
        );

      const user =
        await User.create({
          name,
          email,
          password:
            hashedPassword,
          role:
            role || "USER"
        });

      res.status(201).json({
        message:
          "Registration Successful",
        user
      });

    } catch (error) {
      res.status(500).json({
        message:
          error.message
      });
    }
  }
);

//
// LOGIN
//
router.post(
  "/login",
  async (req, res) => {
    try {
      const {
        email,
        password
      } = req.body;

      const user =
        await User.findOne({
          email
        });

      if (!user) {
        return res.status(400).json({
          message:
            "Invalid Email"
        });
      }

      const validPassword =
        await bcrypt.compare(
          password,
          user.password
        );

      if (!validPassword) {
        return res.status(400).json({
          message:
            "Invalid Password"
        });
      }

      const token =
        jwt.sign(
          {
            id: user._id,
            sub: user.email,
            role: user.role
          },
          process.env.JWT_SECRET,
          {
            expiresIn: "1d"
          }
        );

      res.json({
        token
      });

    } catch (error) {
      res.status(500).json({
        message:
          error.message
      });
    }
  }
);

//
// FORGOT PASSWORD
//
router.post(
  "/forgot-password",
  async (req, res) => {
    try {
      const { email } =
        req.body;

      res.json({
        message:
          `Reset link sent to ${email}`
      });

    } catch (error) {
      res.status(500).json({
        message:
          error.message
      });
    }
  }
);

//
// PROFILE
//
router.get(
  "/profile",
  authMiddleware,
  async (req, res) => {
    try {
      const user =
        await User.findById(
          req.user.id
        ).select("-password");

      res.json(user);

    } catch (error) {
      res.status(500).json({
        message:
          error.message
      });
    }
  }
);

//
// DASHBOARD
//
router.get(
  "/dashboard",
  authMiddleware,
  (req, res) => {
    res.json({
      success: true,
      message:
        "Dashboard Access Granted",
      user: req.user
    });
  }
);

//
// ADMIN ONLY
//
router.post(
  "/admin/register",
  async (req, res) => {
    try {
      const {
        name,
        email,
        password
      } = req.body;

      const existingUser =
        await User.findOne({ email });

      if (existingUser) {
        return res.status(400).json({
          message: "User already exists"
        });
      }

      const hashedPassword =
        await bcrypt.hash(password, 10);

      await User.create({
        name,
        email,
        password: hashedPassword,
        role: "ADMIN"
      });

      res.status(201).json({
        message:
          "Admin Registration Successful"
      });

    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  }
);
router.get(
  "/admin",
  authMiddleware,
  roleMiddleware("ADMIN"),
  (req, res) => {
    res.json({
      success: true,
      message:
        "Welcome Admin",
      user: req.user
    });
  }
);

module.exports = router;