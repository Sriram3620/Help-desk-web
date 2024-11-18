const express=require("express")
const mongoose=require("mongoose")
const cors=require("cors")
const bodyParser = require('body-parser');
const CustomerDetails=require("./Modals/Register")
const Customeragents=require("./Modals/AgentDetails")
const CustomerTickets=require("./Modals/cutomertickets");
const app=express()
const bcrypt=require('bcrypt');
const jwt=require("jsonwebtoken")
app.use(bodyParser.json());
app.use(cors())
app.use(express.json())
mongoose.connect("mongodb+srv://sriram_03:Osriram%4004&@cluster0.ec9nano.mongodb.net/Help-desk",{ useNewUrlParser: true, useUnifiedTopology: true })
const db = mongoose.connection;


db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

app.post("/register",async(req,res)=>
{
    const {name,email}=req.body;
    let {password}=req.body
     password=await bcrypt.hash(password,10);
     const checkUser=await CustomerDetails.findOne({email})
     const count=await CustomerDetails.countDocuments();
     let agent="Agent1";
     if(count>2)
     {
        agent="Agent2";
     }
     const role="customer"
     if(checkUser===null)
     {
         const payload = {
             userMail: email,
           };
           const jwtToken = jwt.sign(payload, "SR_123");
           res.status(200);
           res.send({ jwtToken });
           const newData=await new CustomerDetails({name,password,email,jwtToken,role,agent})
         const saved=await  newData.save()
     }
      else{
         res.send("userAlreadyExist")
      }
})


app.post("/login-customer",async(req,res)=>
    {
        const {email,password}=req.body
        const User=await CustomerDetails.findOne({email})
    
        if(User===null)
        {
            res.send("Invalid User");
        }
        else 
        {
          const isPasswordMatch=await bcrypt.compare(password,User.password)
          if(isPasswordMatch)
          {
            jwt.verify(User.jwtToken, "SR_123", async (error, payload) =>
            {
              if(error)
              {
                res.send("Invalid AccessToken")
              }
              else {
                res.send({Token:User.jwtToken,email:payload.userMail,role:User.role})
              } 
            })
            
          }
          else 
          {
            res.send("Password is Incorrect")
          }
        }
    })
    

 app.post("/login-agent",async(req,res)=>
        {
            const {email,password}=req.body
    
            const User=await Customeragents.findOne({email})

            if(User===null)
            {
                res.send("Invalid User");
            }
            else 
            {
              const checkPass= await Customeragents.findOne({email});
              if(checkPass.password==password)
              {
                res.send({email:email,role:checkPass.role});
              }
              else{
                res.send("Incorrect Password");
              }
            }
        })
        

app.post("/customer-tickets",async(req,res)=>
{
    const {email,name,title,des,notes}=req.body;
    const status="Active";
    const createdtime=new Date();
    const updatedtime=new Date();
    const User=await CustomerDetails.find({email})
    const agent=User[0].agent;  
    const newData=await new CustomerTickets({name,email,title,des,notes,status,createdtime,updatedtime,agent})
    const saved=await  newData.save()
})

app.post("/getcutomertickets",async(req,res)=>
{
  const {email}=req.body;
  const User=await CustomerTickets.find({email})
  res.send(User);
})

app.post("/getagenttickets",async(req,res)=>
{
   const {agent}=req.body;
   const User=await CustomerTickets.find({agent})
   res.send(User);
})

app.post("/customerupdate",async(req,res)=>
{
  const {_id}=req.body;
  const data=req.body;
  const updatedtime=new Date(); 
  const updatedItem = await CustomerTickets.findByIdAndUpdate(_id, {...data,updatedtime}, { new: true });
  res.send(updatedItem)

})

app.get("/admincustomerdata",async(req,res)=>
  {
    const data= await CustomerTickets.find({})
     res.send(data)
  })

app.get("/adminalldata",async(req,res)=>
{
  const data= await CustomerDetails.find({})
  res.send(data)
})

app.get("/agentdata",async(req,res)=>
  {
    const data= await Customeragents.find({})
    res.send(data)
  })


app.listen(3001,()=>{
    console.log("Server is Running");
})