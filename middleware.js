const Listing=require("./models/listing.js");
const ExpressError = require("./util/ExpressError.js");
const { listingSchema } = require("./schema.js");
const {reviewSchema}=require("./schema.js");
const Review=require("./models/review.js");

module.exports.isLoggedIn=(req,res,next)=>{

    console.log(req.user);
    if(!req.isAuthenticated()){
        req.flash("success","You must login first");
        return res.redirect("/login");
    }
    next();
}

module.exports.isOwner=async(req,res,next)=>{
    let { id } = req.params;

    let listing=await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currUser._id)){
      req.flash("success","you don't have permission ");
      return res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports.validatelisting = (req, res, next) => {

  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, error);
  } 
    next();
  
}

module.exports.validateReview=(req,res,next)=>{
    let {error}= reviewSchema.validate(req.body);
    if(error){
      
      let errMsg=error.details.map((el)=>el.message).join(",");
      throw new ExpressError(400,errMsg);
  
    }
    else{
      next();
    }
  }

  module.exports.isAuthor=async(req,res,next)=>{
    
    let {id, reviewId } = req.params;

    let review=await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)){
      req.flash("success","you're not author of this review ");
      return res.redirect(`/listings/${id}`);
    }
    next();
  }