const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");

const errorController = require("./controllers/error");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

// Models
const User = require("./models/user");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({ secret: "my secret", resave: false, saveUninitialized: false })
);

app.use((req, res, next) => {
  User.findById("5ce19df5ce6fbe30492fb511")
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});
app.use(authRoutes);
app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose
  .connect("mongodb://localhost/shop", { useNewUrlParser: true })
  .then(result => {
    User.findOne().then(user => {
      if (!user) {
        const user = new User({
          name: "Damjan",
          email: "dame@radev.com",
          cart: {
            items: []
          }
        });
        user.save();
      }
    });
    app.listen(3000);
  })
  .catch(err => console.log(err));
