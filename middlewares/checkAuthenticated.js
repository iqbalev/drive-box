function checkAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect("/auth/sign-in");
  }

  next();
}

export default checkAuthenticated;
