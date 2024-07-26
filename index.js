const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Order = require('./models/Order');
const { sendOTP, verifyOTP, generateQR } = require('./utils/otp');

const app = express(); //express ko app k through use 
const port = 3001; //port no 

// Ensure the uploads directory exists
const uploadsDir = path.join(__dirname, 'public/uploads');//public folder k andar uload me sre save hore h
if (!fs.existsSync(uploadsDir)) { //aur us photo ka url save hoga db me
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration for handling file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);//date sAVE karega
  }
});
const upload = multer({ storage: storage }).single('pimage');

// Middleware setup
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON request bodies
app.use(express.static('public')); // Serve static files from "public" directory

// MongoDB connection
mongoose.connect('mongodb://0.0.0.0:27017/Beatzy', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Schemas and models
const SignupSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone1: Number,
  passw1: String,
  passw2: String,
});
const SignUpData = mongoose.model('Signup', SignupSchema);

const AddProductSchema = new mongoose.Schema({
  p_id: Number,
  name: String,
  description: String,
  category: String,
  price: Number,
  pimage: String,
});
const AddProductData = mongoose.model('AddProduct', AddProductSchema);

// Routes

// Route for retrieving all products
app.get('/product', async (req, res) => {
  try {
    const products = await AddProductData.find();
    res.json(products);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to retrieve products' });
  }
});

// Route for retrieving a single product by ID
app.get('/product/:p_id', async (req, res) => {
  try {
    const productId = req.params.p_id;
    const product = await AddProductData.findOne({ p_id: productId });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to retrieve product' });
  }
});

// Route for adding a new product
app.post('/product', (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error uploading file');
    } else {
      const newProduct = new AddProductData({
        p_id: req.body.p_id,
        name: req.body.name,
        description: req.body.description,
        category: req.body.category,
        price: req.body.price,
        pimage: 'http://localhost:3001/uploads/' + req.file.filename,
      });
      try {
        await newProduct.save();
        res.send('File Uploaded');
      } catch (error) {
        console.error('Error saving product:', error);
        res.status(500).json({ error: 'Failed to save product' });
      }
    }
  });
});

// Route for updating an existing product
app.put('/product/:p_id', (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error uploading file');
    } else {
      try {
        const productId = req.params.p_id;
        const updatedData = {
          name: req.body.name,
          description: req.body.description,
          category: req.body.category,
          price: req.body.price,
        };
        if (req.file) {
          updatedData.pimage = 'http://localhost:3001/uploads/' + req.file.filename;
        }
        const updatedProduct = await AddProductData.findOneAndUpdate(
          { p_id: productId },
          updatedData,
          { new: true }
        );
        if (!updatedProduct) {
          return res.status(404).json({ error: 'Product not found' });
        }
        res.json(updatedProduct);
      } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Failed to update product' });
      }
    }
  });
});

// Route for deleting an existing product
app.delete('/product/:p_id', async (req, res) => {
  try {
    const productId = req.params.p_id;
    const deletedProduct = await AddProductData.findOneAndDelete({ p_id: productId });
    if (!deletedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Route for user signup
app.post('/signup', async (req, res) => {
  try {
    const { name, email, phone1, passw1, passw2 } = req.body;
    const newItem = new SignUpData({ name, email, phone1, passw1, passw2 });
    await newItem.save();
    res.json({ message: 'Item added successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to add item' });
  }
});

// Route for user login
app.post('/login', (req, res) => {
  const { email, passw1 } = req.body;
  SignUpData.findOne({ email })
    .then(user => {
      if (user) {
        if (user.passw1 === passw1) {
          res.json('Success');
        } else {
          res.json('The password is incorrect');
        }
      } else {
        res.json('No record found');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      res.status(500).json({ error: 'Failed to log in' });
    });
});

// Route for sending OTP
app.post('/send-otp', async (req, res) => {
  const { phone } = req.body;
  try {
    const response = await sendOTP(phone);
    res.json({ success: true, ...response });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.json({ success: false, message: 'Failed to send OTP' });
  }
});

// Route for verifying OTP
app.post('/verify-otp', async (req, res) => {
  const { phone, otp } = req.body;
  try {
    const response = await verifyOTP(phone, otp);
    res.json({ success: response });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.json({ success: false, message: 'Failed to verify OTP' });
  }
});

// Route for placing an order
app.post('/api/orders', async (req, res) => {
  const { cart, name, phone, address } = req.body;

  // Prepare the products array from the cart
  const products = cart.map(item => ({
    name: item.name,
    price: item.price,
    quantity: item.quantity
  }));

  // Calculate the total amount
  const amount = products.reduce((total, product) => total + product.price * product.quantity, 0);

  // Create a new order instance
  const newOrder = new Order({
    products,
    amount,
    address
  });

  try {
    // Save the order to the database
    await newOrder.save();
    res.json({ success: true, message: 'Order placed successfully' });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

// Route for retrieving all orders
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to retrieve orders' });
  }
});

// Route for generating QR code
app.post('/api/generate-qr', async (req, res) => {
  try {
    const { qrValue } = req.body;
    const qrCodeUrl = await generateQR(qrValue);
    res.json({ qrCodeUrl });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
