import { fileURLToPath } from "node:url";
import path from "node:path";
import express from "express";
import sessionConfig from "./config/sessionConfig.js";
import passport from "./config/passportConfig.js";
import flash from "express-flash";
import dashboardRouter from "./routes/dashboardRouter.js";
import authRouter from "./routes/authRouter.js";
import pageNotFoundHandler from "./middlewares/pageNotFoundHandler.js";
import globalErrorHandler from "./middlewares/globalErrorHandler.js";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(sessionConfig);
app.use(passport.session());
app.use(flash());

app.get("/", (req, res) => res.redirect("/auth/sign-in"));
app.use("/auth", authRouter);
app.use("/dashboard", dashboardRouter);

app.use(pageNotFoundHandler);
app.use(globalErrorHandler);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
