const mongoose = require('mongoose');

const userScheme=new mongoose.Schema({
  name:String,
  password:String,
  email:String,
  role:String,
})

const Customeragents=mongoose.model('customeragents',userScheme)
module.exports=Customeragents;