const mongoose = require('mongoose');

const userScheme=new mongoose.Schema({
  name:String,
  password:String,
  email:String,
  jwtToken:String,
  role:String,
  agent:String,
})

const CustomerDetails=mongoose.model('customerdetails',userScheme)
module.exports=CustomerDetails