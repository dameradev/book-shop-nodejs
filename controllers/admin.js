const mongoose = require("mongoose");
const { validationResult } = require("express-validator/check");

const countCartItems = require("../util/cartItems");
const fileHelper = require("../util/file");

const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
  const cartItems = countCartItems(req.user);
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    hasError: false,
    isAuthenticated: req.session.isLoggedIn,
    errorMessage: "",
    validationErrors: [],
    cartItems
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;
  const code = req.body.code;
  const length = req.body.length;
  console.log(code,length)

  if (!image) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      hasError: true,
      isAuthenticated: req.session.isLoggedIn,
      errorMessage: "Attached file is not an image",
      product: {
        title,
        price,
        description,
        code,
        length
      },
      validationErrors: []
    });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      hasError: true,
      isAuthenticated: req.session.isLoggedIn,
      errorMessage: errors.array()[0].msg,
      product: {
        title,
        price,
        description,
        code,
        length
      },
      validationErrors: errors.array()
    });
  }
  const imageUrl = image.path;

  console.log(imageUrl);

  const product = new Product({
    // _id: mongoose.Types.ObjectId("5cec042952b76b187e066e28"),
    title,
    imageUrl,
    price,
    description,
    userId: req.user,
    code,
    length
  });
  product
    .save()
    .then(result => {
      console.log("Created Product");
      res.redirect("/admin/products");
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
    });
};
exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  const cartItems = countCartItems(req.user);
  if (!editMode) {
    res.redirect("/");
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      if (!product) {
        fileHelper.deleteFile(product.imageUrl);
        return res.redirect("/");
      }
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: true,
        hasError: false,
        product: product,
        errorMessage: "",
        isAuthenticated: req.session.isLoggedIn,
        validationErrors: [],
        cartItems
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
    });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const image = req.file;
  const updatedDesc = req.body.description;
  const updatedPrice = req.body.price;
  const updatedCode = req.body.code;
  const updatedLength = req.body.length;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: true,
      hasError: true,
      isAuthenticated: req.session.isLoggedIn,
      errorMessage: errors.array()[0].msg,
      product: {
        title: updatedTitle,
        price: updatedPrice,
        description: updatedDesc,
        code: updatedCode,
        length: updatedLength,
        _id: prodId
      },
      validationErrors: errors.array()
    });
  }
  Product.findById(prodId)
    .then(product => {
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect("/");
      }
      product.title = updatedTitle;
      product.description = updatedDesc;
      product.price = updatedPrice;
      product.code = updatedCode;
      product.length = updatedLength;
      if (image) {
        product.imageUrl = image.path;
      }

      return product.save().then(result => {
        console.log("Updated Product!");
        res.redirect("/admin/products");
      });
    })
    .catch(err => {
      const error = new Error(err);
      console.log(err)
      error.httpStatusCode = 500;
      return next(err);
    });
};

exports.getProducts = (req, res, next) => {
  const cartItems = countCartItems(req.user);
  Product.find({ userId: req.user._id })
    .then(products => {
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
        isAuthenticated: req.session.isLoggedIn,
        cartItems
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
    });
};

exports.deleteProduct = async (req, res, next) => {
  const prodId = req.params.productId;
  const product = await Product.findById(prodId);
  await fileHelper.deleteFile(product.imageUrl);
  Product.deleteOne({ _id: prodId, userId: req.user._id })
    .then(() => {
      console.log("Destroyed product");
      res.status(200).json({ message: "Success!" });
    })
    .catch(err => {
      res.status(500).json({ message: "Deleting product failed" });
    });
};
