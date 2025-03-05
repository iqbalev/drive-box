import { Router } from "express";
import prisma from "../utils/prismaClient.js";
import bcryptjs from "bcryptjs";
import passport from "../config/passportConfig.js";

const authRouter = Router();

// Sign Up Router
authRouter.get("/sign-up", (req, res) => res.render("auth/sign-up"));
authRouter.post("/sign-up", async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcryptjs.hash(password, 5);
    await prisma.user.create({
      data: {
        username: username,
        email: email,
        hashedPassword: hashedPassword,
      },
    });

    return res.redirect("/auth/sign-in");
  } catch (error) {
    return next(error);
  }
});

// Sign In Router
authRouter.get("/sign-in", (req, res) => res.render("auth/sign-in"));
authRouter.post("/sign-in", async (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.json({ msg: info.message });
    }

    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }

      return res.redirect("/dashboard");
    });
  })(req, res, next);
});

// Sign Out Router
authRouter.post("/sign-out", (req, res, next) => {
  req.logOut((err) => {
    if (err) {
      return next(err);
    }

    return res.redirect("/auth/sign-in");
  });
});

export default authRouter;
