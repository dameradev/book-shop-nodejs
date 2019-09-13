const fs = require("fs");
const path = require("path");

const stripe = require("stripe")("sk_test_4WjBelrKcLjQ3DZrV7OzcDEv");
const PDFDocument = require("pdfkit");

const countCartItems = require("../util/cartItems");

const Product = require("../models/product");
const Order = require("../models/order");

const ITEMS_PER_PAGE = 2;

exports.getProducts = (req, res, next) => {
  if (req.user === undefined) {
    return res.redirect('/signup?message="Register or login to view products"');
  }

  const page = +req.query.page || 1;
  let totalItems;
  const cartItems = countCartItems(req.user);

  Product.find()
    .countDocuments()
    .then(numProducts => {
      totalItems = numProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then(products => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "Products",
        path: "/products",
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
        cartItems
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;

  const cartItems = countCartItems(req.user);
  Product.findById(prodId)
    .then(product => {
      res.render("shop/product-detail", {
        product: product,
        pageTitle: product.title,
        path: "/products",
        isAuthenticated: req.session.isLoggedIn,
        cartItems
      });
      console.log(product);
    })

    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
    });
};

exports.getIndex = (req, res, next) => {
  // const page = +req.query.page || 1;
  let totalItems;

  // const cartItems = countCartItems(req.user);

  // Product.find()
  //   .countDocuments()
  //   .then(numProducts => {
  //     totalItems = numProducts;
  //     return Product.find()
  //       .skip((page - 1) * ITEMS_PER_PAGE)
  //       .limit(ITEMS_PER_PAGE);
  //   })
  //   .then(products => {
  //     console.log(products);
  res.render("shop/index", {
    // prods: products,
    pageTitle: "Shop",
    path: "/"
    // currentPage: page,
    // hasNextPage: ITEMS_PER_PAGE * page < totalItems,
    // hasPreviousPage: page > 1,
    // nextPage: page + 1,
    // previousPage: page - 1,
    // lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
    // cartItems
  });
  // })
  // .catch(err => {
  //   const error = new Error(err);
  //   error.httpStatusCode = 500;
  //   return next(err);
  // });
};

exports.getCart = (req, res, next) => {
  const cartItems = countCartItems(req.user);

  req.user
    .deepPopulate("cart.items.productId")
    .then(user => {
      // console.log(user.cart.items);
      const products = user.cart.items;
      console.log(products);
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: products,
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

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;

  Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(result => {
      console.log(result);
      res.redirect("/cart");
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then(result => {
      res.redirect("/cart");
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
    });
};

exports.getCheckout = (req, res, next) => {
  const cartItems = countCartItems(req.user);
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then(user => {
      console.log(user.cart.items);
      const products = user.cart.items;
      let total = 0;
      products.forEach(p => {
        total += p.quantity * p.productId.price;
      });
      total = total.toFixed(2);
      res.render("shop/checkout", {
        path: "/checkout",
        pageTitle: "Checkout",
        products: products,
        totalSum: total,
        cartItems
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
    });
};
exports.postOrder = (req, res, next) => {
  // Token is created using Checkout or Elements!
  // Get the payment token ID submitted by the form:
  const token = req.body.stripeToken; // Using Express
  let totalSum = 0;

  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then(user => {
      user.cart.items.forEach(p => {
        totalSum += p.quantity * p.productId.price;
      });

      const products = user.cart.items.map(i => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user
        },
        products: products
      });
      return order.save();
    })
    .then(result => {
      const charge = stripe.charges.create({
        amount: 25.99,
        currency: "usd",
        description: "Demo Order",
        source: token,
        metadata: { order_id: result._id.toString() }
      });
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect("/orders");
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getOrders = (req, res, next) => {
  const cartItems = countCartItems(req.user);
  Order.find({ "user.userId": req.session.user._id })
    .then(orders => {
      res.render("shop/orders", {
        orders: orders,
        path: "/orders",
        pageTitle: "Your Orders",
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

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .then(order => {
      if (!order) {
        return next(new Error("No order found!"));
      }
      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error("Not authorized"));
      }
      const invoiceName = "invoice-" + orderId + ".pdf";
      const invoicePath = path.join("data", "invoices", invoiceName);

      const pdfDoc = new PDFDocument();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        'inline; filename="' + invoiceName + '"'
      );
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      pdfDoc.fontSize(26).text("Invoice", {
        underline: true
      });
      pdfDoc.text("---------------------------");
      let totalPrice = 0;
      order.products.forEach(prod => {
        totalPrice += prod.quantity * prod.product.price;
        pdfDoc
          .fontSize(14)
          .text(
            prod.product.title +
              " - " +
              prod.quantity +
              " x " +
              "$" +
              prod.product.price
          );
      });
      pdfDoc.text("---------------------------");

      pdfDoc.fontSize(26).text("Total Price: $" + totalPrice);

      pdfDoc.end();
    })
    .catch(err => next(err));
};
