const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require('body-parser');
const dotenv = require('dotenv');  

const CustomerDetails = require("./Modals/Register");
const Customeragents = require("./Modals/AgentDetails");
const CustomerTickets = require("./Modals/cutomertickets");

const app = express();
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");

dotenv.config(); 

app.use(bodyParser.json());
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

app.get('/hello-world', (req, res) => {
  res.send('Hello, World!');
});

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const checkUser = await CustomerDetails.findOne({ email });
  const count = await CustomerDetails.countDocuments();
  let agent = count > 2 ? "Agent2" : "Agent1";
  const role = "customer";

  if (!checkUser) {
    const payload = { userMail: email };
    const jwtToken = jwt.sign(payload, process.env.JWT_SECRET); 
    res.status(200).send({ jwtToken });
    
    const newUser = new CustomerDetails({ name, password: hashedPassword, email, jwtToken, role, agent });
    await newUser.save();
  } else {
    res.send("User already exists");
  }
});

app.post("/login-customer", async (req, res) => {
  const { email, password } = req.body;
  const user = await CustomerDetails.findOne({ email });

  if (!user) {
    res.send("Invalid User");
  } else {
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (isPasswordMatch) {
      jwt.verify(user.jwtToken, process.env.JWT_SECRET, async (error, payload) => {
        if (error) {
          res.send("Invalid AccessToken");
        } else {
          res.send({ Token: user.jwtToken, email: payload.userMail, role: user.role });
        }
      });
    } else {
      res.send("Password is Incorrect");
    }
  }
});


app.post("/getcutomertickets", async (req, res) => {
  const { email } = req.body;
  const tickets = await CustomerTickets.find({ email });
  res.send(tickets);
});

app.post("/getagenttickets", async (req, res) => {
  const { agent } = req.body;
  const tickets = await CustomerTickets.find({ agent });
  res.send(tickets);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
