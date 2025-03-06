import { validationResult } from "express-validator";

function validationErrorHandler(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash("errors", errors.array());
    return res.redirect(req.get("referrer"));
  }

  next();
}

export default validationErrorHandler;
