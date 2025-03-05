import { Router } from "express";

const dashboardRouter = Router();

dashboardRouter.get("/", (req, res) => res.render("dashboard/index"));

export default dashboardRouter;
