const express = require("express");
const { body } = require("express-validator/check");

const adminController = require("../controllers/admin");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

// /admin/add-product => GET
router.get("/add-product", isAuth, adminController.getAddProduct);

// /admin/products => GET
router.get("/products", isAuth, adminController.getProducts);

// // /admin/add-product => POST
router.post(
  "/add-product",
  isAuth,
  [
    body("title", "Title must contain only numbers and letters")
      .isString()
      .isLength({ min: 3 })
      .trim(),
    body("imageUrl")
      .isURL()
      .withMessage("Image url must be a valid url."),
    body("price")
      .isFloat()
      .withMessage("Price must be with decimal places."),
    body("description")
      .isLength({ min: 5 })
      .withMessage("Description must be atleast 5 charachters")
  ],
  adminController.postAddProduct
);

// /admin/edit-product => GET
router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);

// // /admin/edit-product => POST
router.post(
  "/edit-product",
  [
    body("title", "Title must contain only numbers and letters")
      .isString()
      .isLength({ min: 3 })
      .trim(),
    body("imageUrl")
      .isURL()
      .withMessage("Image url must be a valid url."),
    body("price")
      .isFloat()
      .withMessage("Price must be with decimal places."),
    body("description")
      .isLength({ min: 5 })
      .withMessage("Description must be atleast 5 charachters")
  ],
  isAuth,
  adminController.postEditProduct
);

router.post("/delete-product", isAuth, adminController.postDeleteProduct);

module.exports = router;
