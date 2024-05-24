const express = require('express');
const cors = require('cors'); // Import cors module
const app = express();
const port = 3001;

const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://akshatjoshi753:ShaijalandAkshatProject@ecommerce.jtuo2qf.mongodb.net/?retryWrites=true&w=majority&appName=ECommerce', { useNewUrlParser: true, useUnifiedTopology: true });


const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

const SignupSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone1: Number,
  passw1:String,
  passw2:String
});
const SignUpData = mongoose.model('Signup', SignupSchema);
// Use cors middleware
app.use(cors());

app.use(express.json());

//signup ka data
app.post('/Signup', async (req, res) => {//.loggin ki jgah jo bhi colection ka name fre
  try {
    const { name, email, phone1 ,passw1,passw2} = req.body;
    const newItem = new SignUpData({ name, email, phone1,passw1,passw2 });
    await newItem.save();
    res.json({ message: 'Item added successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to add item' });
  }
});

//login
app.post("/login",(req,res)=>{
  const {email,passw1}=req.body;
  SignUpData.findOne({email:email})
  .then(user=> {
    if(user){
      if(user.passw1===passw1)
      {
        res.json("Success")
      }else{
        res.json("the password is incorrect")
        }
    }else{
      res.json("No reCord Found")
    }
  })
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
