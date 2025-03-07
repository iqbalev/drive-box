import { Router } from "express";
import prisma from "../utils/prismaClient.js";

const dashboardRouter = Router();

// /dashboard Route
dashboardRouter.get("/", async (req, res, next) => {
  try {
    const allFolders = await prisma.folder.findMany({
      where: {
        ownerId: res.locals.user.id,
      },
    });

    return res.render("dashboard", { folders: allFolders });
  } catch (error) {
    return next(error);
  }
});

dashboardRouter.post("/create-folder", async (req, res, next) => {
  try {
    await prisma.folder.create({
      data: {
        name: req.body.newFolder,
        ownerId: res.locals.user.id,
      },
    });

    return res.redirect("/dashboard");
  } catch (error) {
    return next(error);
  }
});

dashboardRouter.put("/rename-folder/:folderId", async (req, res, next) => {
  try {
    await prisma.folder.update({
      where: {
        id: req.params.folderId,
        ownerId: res.locals.user.id,
      },
      data: {
        name: req.body.renameFolder,
      },
    });

    return res.redirect("/dashboard");
  } catch (error) {
    return next(error);
  }
});

dashboardRouter.delete("/delete-folder/:folderId", async (req, res, next) => {
  try {
    await prisma.folder.delete({
      where: {
        id: req.params.folderId,
        ownerId: res.locals.user.id,
      },
    });

    return res.redirect("/dashboard");
  } catch (error) {
    return next(error);
  }
});

// /dashboard/folder Route
dashboardRouter.get("/folder/:folderId", async (req, res, next) => {
  try {
    const currentFolder = await prisma.folder.findFirst({
      where: {
        id: req.params.folderId,
        ownerId: res.locals.user.id,
      },
    });

    return res.render("dashboard/folder", { currentFolder });
  } catch (error) {
    return next(error);
  }
});

export default dashboardRouter;
