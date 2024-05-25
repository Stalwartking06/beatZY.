const mongoose = require('mongoose');

// Define the schema for "rashi" collection
const AddProductSchema = new mongoose.Schema({
  pid: String,
  pname: String,
  pdesc: String,
  pimage: String
});
const AddProductData = mongoose.model('AddProduct', AddProductSchema);

module.exports = {
  AddProductData
};
