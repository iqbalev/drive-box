import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import prisma from "../utils/prismaClient.js";
import bcryptjs from "bcryptjs";

passport.use(
  new LocalStrategy(
    { usernameField: "identifier" },
    async (identifier, password, done) => {
      try {
        const user = await prisma.user.findFirst({
          where: { OR: [{ username: identifier }, { email: identifier }] },
        });

        if (!user) {
          return done(null, false, { message: "Invalid username or email." });
        }

        const match = await bcryptjs.compare(password, user.hashedPassword);
        if (!match) {
          return done(null, false, { message: "Invalid password." });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  return done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: id },
    });

    return done(null, user);
  } catch (error) {
    return done(error);
  }
});

export default passport;
