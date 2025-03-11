import { Router } from "express";
import path from "path";
import prisma from "../utils/prismaClient.js";
import supabase from "../utils/supabaseClient.js";
import upload from "../config/multerConfig.js";
import { formatFileSize } from "../utils/formatFileSize.js";
import "dotenv/config";

const dashboardRouter = Router();

// /dashboard Route
dashboardRouter.get("/", async (req, res, next) => {
  try {
    const folderCount = await prisma.folder.count({
      where: {
        ownerId: res.locals.user.id,
      },
    });

    const folders = await prisma.folder.findMany({
      where: {
        ownerId: res.locals.user.id,
      },
    });

    const fileCount = await prisma.file.count({
      where: {
        ownerId: res.locals.user.id,
      },
    });

    const files = await prisma.file.findMany({
      where: {
        ownerId: res.locals.user.id,
      },
    });

    const filesWithFormattedSize = formatFileSize(files);

    return res.render("dashboard", {
      folderCount,
      folders,
      fileCount,
      files: filesWithFormattedSize,
    });
  } catch (error) {
    return next(error);
  }
});

dashboardRouter.post(
  "/upload-file",
  upload.single("newFile"),
  async (req, res, next) => {
    try {
      const { mimetype, size, buffer, originalname } = req.file;
      const extension = path.extname(originalname);
      const nameNoExtension = path.basename(originalname, extension);
      const filePath = nameNoExtension + "_" + Date.now() + extension;

      const { data, error } = await supabase.storage
        .from(process.env.SUPABASE_BUCKET_NAME)
        .upload(filePath, buffer, {
          contentType: mimetype,
        });

      await prisma.file.create({
        data: {
          name: filePath,
          mimetype: mimetype,
          size: parseInt(size),
          url: filePath,
          ownerId: res.locals.user.id,
        },
      });

      return res.redirect("/dashboard");
    } catch (error) {
      return next(error);
    }
  }
);

dashboardRouter.post("/download-file/:fileId", async (req, res, next) => {
  try {
    const file = await prisma.file.findUnique({
      where: {
        id: req.params.fileId,
        ownerId: res.locals.user.id,
      },
    });

    const { data, error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET_NAME)
      .download(file.url);

    const arrayBuffer = await data.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader("Content-Type", file.mimetype);
    res.setHeader("Content-Disposition", `attachment; filename="${file.name}"`);

    res.send(buffer);
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

dashboardRouter.delete("/delete-file/:fileId", async (req, res, next) => {
  try {
    const file = await prisma.file.findUnique({
      where: {
        id: req.params.fileId,
        ownerId: res.locals.user.id,
      },
    });

    const { data, error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET_NAME)
      .remove([file.name]);

    await prisma.file.delete({
      where: {
        id: req.params.fileId,
        ownerId: res.locals.user.id,
      },
    });

    return res.redirect("/dashboard");
  } catch (error) {
    return next(error);
  }
});

dashboardRouter.delete("/delete-folder/:folderId", async (req, res, next) => {
  try {
    const files = await prisma.file.findMany({
      where: {
        folderId: req.params.folderId,
        ownerId: res.locals.user.id,
      },
    });

    const { data, error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET_NAME)
      .remove(files.map((file) => file.name));

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
    const folder = await prisma.folder.findFirst({
      where: {
        id: req.params.folderId,
        ownerId: res.locals.user.id,
      },
    });

    const fileCount = await prisma.file.count({
      where: {
        folderId: req.params.folderId,
        ownerId: res.locals.user.id,
      },
    });

    const files = await prisma.file.findMany({
      where: {
        folderId: req.params.folderId,
        ownerId: res.locals.user.id,
      },
    });

    const filesWithFormattedSize = formatFileSize(files);

    return res.render("dashboard/folder", {
      folder,
      fileCount,
      files: filesWithFormattedSize,
    });
  } catch (error) {
    return next(error);
  }
});

dashboardRouter.post(
  "/folder/:folderId/upload-file",
  upload.single("newFile"),
  async (req, res, next) => {
    try {
      const { mimetype, size, buffer, originalname } = req.file;
      const extension = path.extname(originalname);
      const nameNoExtension = path.basename(originalname, extension);
      const filePath = nameNoExtension + "_" + Date.now() + extension;

      const { data, error } = await supabase.storage
        .from(process.env.SUPABASE_BUCKET_NAME)
        .upload(filePath, buffer, { contentType: mimetype });

      await prisma.file.create({
        data: {
          name: filePath,
          mimetype: mimetype,
          size: parseInt(size),
          url: filePath,
          folderId: req.params.folderId,
          ownerId: res.locals.user.id,
        },
      });

      return res.redirect(`/dashboard/folder/${req.params.folderId}`);
    } catch (error) {
      return next(error);
    }
  }
);

dashboardRouter.post(
  "/folder/:folderId/download-file/:fileId",
  async (req, res, next) => {
    try {
      const file = await prisma.file.findUnique({
        where: {
          id: req.params.fileId,
          folderId: req.params.folderId,
          ownerId: res.locals.user.id,
        },
      });

      const { data, error } = await supabase.storage
        .from(process.env.SUPABASE_BUCKET_NAME)
        .download(file.url);

      const arrayBuffer = await data.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      res.setHeader("Content-Type", file.mimetype);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${file.name}"`
      );

      res.send(buffer);
    } catch (error) {
      return next(error);
    }
  }
);

dashboardRouter.delete(
  "/folder/:folderId/delete-file/:fileId",
  async (req, res, next) => {
    try {
      const file = await prisma.file.findUnique({
        where: {
          id: req.params.fileId,
          folderId: req.params.folderId,
          ownerId: res.locals.user.id,
        },
      });

      const { data, error } = await supabase.storage
        .from(process.env.SUPABASE_BUCKET_NAME)
        .remove([file.name]);

      await prisma.file.delete({
        where: {
          id: req.params.fileId,
          folderId: req.params.folderId,
          ownerId: res.locals.user.id,
        },
      });

      return res.redirect(`/dashboard/folder/${req.params.folderId}`);
    } catch (error) {
      return next(error);
    }
  }
);

export default dashboardRouter;
