const Cart = require('./cart.model');

async function deleteUserCartDocument(userId) {
  await Cart.deleteOne({
    userId,
  });
}

module.exports = {
  deleteUserCartDocument,
};
