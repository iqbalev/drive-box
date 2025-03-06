import { body } from "express-validator";

const validateSignIn = [
  body("identifier")
    .trim()
    .notEmpty()
    .withMessage("Please enter your username or email."),

  body("password").trim().notEmpty().withMessage("Please enter your password."),
];

export default validateSignIn;
