const User = require("../models/user");
exports.getLogin = (req, res, next) => {
  // const isLoggedIn = req
  //   .get("Cookie")
  //   .split(";")[2]
  //   .trim()
  //   .split("=")[1];
  console.log(req.session.isLoggedIn);
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Log in",
    isAuthenticated: false
  });
};

exports.postLogin = async (req, res, next) => {
  const user = await User.findById("5ce19df5ce6fbe30492fb511");

  req.session.user = user;
  req.session.isLoggedIn = true;
  await req.session.save();
  res.redirect("/");
};


exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect('/');
  });
}