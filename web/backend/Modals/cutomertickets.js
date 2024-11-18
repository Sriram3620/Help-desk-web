const mongoose = require('mongoose');

const userScheme=new mongoose.Schema({
  name:String,
  email:String,
  title:String,
  des:String,
  notes:String,
  status:String,
  createdtime:String,
  updatedtime:String,
  agent:String,
})

const CustomerTickets=mongoose.model('customertickets',userScheme)
module.exports=CustomerTickets;