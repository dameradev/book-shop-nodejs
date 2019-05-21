exports.getLogin = (req, res, next) => {
  const isLoggedIn = req
    .get("Cookie")
    .split(";")[2]
    .trim()
    .split("=")[1];

  res.render("auth/login", {
    path: "/login",
    pageTitle: "Log in",
    isAuthenticated: isLoggedIn
  });
};

exports.postLogin = (req, res, next) => {
  res.cookie("loggedIn", true);
  res.redirect("/");
};
