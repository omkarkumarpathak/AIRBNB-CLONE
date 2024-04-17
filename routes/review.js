const express=require("express");
const router=express.Router({mergeParams:true});
const wrapAsync=require("../util/wrapAsync.js");

const Review=require("../models/review.js");
const Listing=require("../models/listing.js");
const {isLoggedIn,validateReview,isAuthor}=require("../middleware.js");

//Reviews
//Review Route

router.post("/",validateReview,isLoggedIn,
wrapAsync(async(req,res)=>{

    let listing=await Listing.findById(req.params.id);
    let newReview=new Review(req.body.review);
    newReview.author=req.user._id;
    listing.reviews.push(newReview);
  
    console.log(newReview);

    await newReview.save();
    await listing.save();
    req.flash("success","Review added");
    
   res.redirect(`/listings/${listing._id}`)  ;
  }));
  
  
  //review delete id
  
  router.delete("/:reviewId",isLoggedIn, isAuthor,  
    wrapAsync(async(req,res)=>{
  
    let {id,reviewId}=req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
  
    let review=await Review.findByIdAndDelete(reviewId);
    console.log(review);
    req.flash("success","review deleted");
    
    res.redirect(`/listings/${id}`);
  }))
  
  module.exports=router;