module.exports = user => {
  let cartItems = 0;
  user.cart.items.forEach(p => {
    cartItems += p.quantity;
  });
  return cartItems;
};
