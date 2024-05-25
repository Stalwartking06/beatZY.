const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const port = 3001;

// Ensure the uploads directory exists
const uploadsDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration for handling file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage }).single("pimage");

// Middleware setup
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON request bodies
app.use(express.static("public")); // Serve static files from "public" directory

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/Beatzy', {
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
  passw2: String
});
const SignUpData = mongoose.model('Signup', SignupSchema);

const AddProductSchema = new mongoose.Schema({
  p_id: Number,
  name: String,
  description: String,
  category: String,
  price: Number,
  pimage: String
});
const AddProductData = mongoose.model('AddProduct', AddProductSchema);

// Routes
app.post('/Signup', async (req, res) => {
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

app.post("/login", (req, res) => {
  const { email, passw1 } = req.body;
  SignUpData.findOne({ email })
    .then(user => {
      if (user) {
        if (user.passw1 === passw1) {
          res.json("Success");
        } else {
          res.json("The password is incorrect");
        }
      } else {
        res.json("No record found");
      }
    })
    .catch(err => {
      console.error('Error:', err);
      res.status(500).json({ error: 'Failed to find user' });
    });
});

app.post("/product", (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error uploading file");
    } else {
      const newProduct = new AddProductData({
        p_id: req.body.p_id,
        name: req.body.name,
        description: req.body.description,
        category: req.body.category,
        price: req.body.price,
        pimage: "http://localhost:3001/uploads/" + req.file.filename
      });
      await newProduct.save();
      res.send("File Uploaded");
    }
  });
});
// Route for retrieving all All products
app.get("/product", async (req, res) => {
  try {
    const products = await AddProductData.find();
    res.json(products);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to retrieve rashi products' });
  }
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
