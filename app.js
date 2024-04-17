const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate= require('ejs-mate');
const ExpressError=require("./util/ExpressError.js");
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

//Router Require
const listingRouter=require("./routes/listings.js")
const reviewRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");


const session=require("express-session");
const flash=require("connect-flash");

const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");



main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,"/public")));


const sessionOptions={
  secret: "mysupersecretcode",
  resave:false,
  saveUnitintialized:true,

  cookie:{
    expires: Date.now()+7*24*60*60*1000,
    maxAge:7*24*60*60*1000,
    httpOnly:true,
  }
}



app.get("/", (req, res) => {
  res.send("Hi, I am root");
});

app.use(session(sessionOptions));

//flash settings
//npm i connect-flash




// app.get("/demouser",async(req,res)=>{
//   let fakeUser=new User({
//     email:"omak",
//     username:"omkar",
//   })
//   let registeredUser=await User.register(fakeUser,"password hai");
//   res.send(registeredUser);
// })

//authentication

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use((req,res,next)=>{
  res.locals.success=req.flash("success");
  res.locals.currUser=req.user;
   console.log(req.user); 
  next();
})


//we'r using pbkdf2 hashing algorithm

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//routers

app.use("/",userRouter);
app.use("/listings",listingRouter)
app.use("/listings/:id/reviews",reviewRouter);


app.all("*",(req,res,next)=>{
  next(new ExpressError(404,"Page Node Found"));
})

app.use((err,req,res,next)=>{
  let {statusCode=500,message="Something went road"}=err;
  res.status(statusCode).render("listings/error.ejs",{err});
})

app.listen(8000, () => {
  console.log("server is listening to port 8080");
});