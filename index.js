const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");

const errorController = require("./controllers/error");
const mongoConnect = require("./util/database").mongoConnect;
// const getDb = require('./util/database').getDb;
const mongodb = require("mongodb");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

// Models
const User = require("./models/user");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  User.findById("5ce1649ea35e78f3da68d9d6")
    .then(user => {
      req.user = new User(user.username, user.email, user.cart, user._id);
      next();
    })
    .catch(err => console.log(err));
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoConnect(async req => {
  // let user = await User.findById("5ce14518e10db910805e7c0d");
  //   if(req.user) {
  //     return re.user;
  //   } else{
  //     user = new User('dameradev', 'dame@radev.com');
  //     user.save();
  //     return user;
  // }
  app.listen(3000);
});
