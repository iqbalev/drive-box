import CustomError from "../utils/CustomError.js";

function pageNotFoundHandler(req, res, next) {
  next(new CustomError("Page Not Found", 404));
}

export default pageNotFoundHandler;
