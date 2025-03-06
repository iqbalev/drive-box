import { body } from "express-validator";
import prisma from "../utils/prismaClient.js";

const validateSignUp = [
  body("username")
    .trim()
    .toLowerCase()
    .notEmpty()
    .withMessage("Username is required.")
    .isLength({ min: 3, max: 20 })
    .withMessage("Username must be between 3 and 20 characters.")
    .isAlphanumeric()
    .withMessage("Username can only contain letters and numbers.")
    .custom(async (value) => {
      const existingUsername = await prisma.user.findUnique({
        where: { username: value },
      });

      if (existingUsername) throw new Error("Username already taken.");
      return true;
    }),

  body("email")
    .trim()
    .toLowerCase()
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Email is not valid.")
    .custom(async (value) => {
      const existingEmail = await prisma.user.findUnique({
        where: {
          email: value,
        },
      });

      if (existingEmail) throw new Error("Email already taken.");
      return true;
    }),

  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required.")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters."),

  body("confirmPassword")
    .trim()
    .notEmpty()
    .withMessage("Password confirmation is required.")
    .custom((value, { req }) => {
      if (value !== req.body.password)
        throw new Error("Passwords do not match.");
      return true;
    }),
];

export default validateSignUp;
