// models/Order.js

const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  amount: { type: Number, required: true },
  products: [{
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true }
  }],
  address: { type: String, required: true },
});

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;
