const express = require("express");
const router = express.Router();
const wrapAsync = require("../util/wrapAsync.js");
const ExpressError = require("../util/ExpressError.js");
const { listingSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const { isLoggedIn,isOwner,validatelisting } = require("../middleware.js");


//Index Route
router.get("/", 
  wrapAsync(async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
}));

//New Route
router.get("/new", isLoggedIn, (req, res) => {
  //console.log(req.user)
  res.render("listings/new.ejs");
});

//Show Route
router.get("/:id", 
  wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
  .populate({
    path:"reviews",
    populate:{
      path:"author",
    }
  })
  .populate("owner");

  if (!listing) {
    req.flash("success", "Does not exist");
    res.redirect("/listings");
  }

  res.render("listings/show.ejs", { listing });
}));

//Create Route
router.post("/", validatelisting, wrapAsync(async (req, res, next) => {

  // if(!req.body.listing){
  //   throw new ExpressError(400,"Send Valid data for listing");
  // }

  const newListing = new Listing(req.body.listing);
  newListing.owner=req.user._id;
  await newListing.save();
  req.flash("success", "new list created successfully");
  res.redirect("/listings");
}));

//Edit Route
router.get("/:id/edit", isLoggedIn,isOwner,wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  req.flash("success", "listing updated");

  res.render("listings/edit.ejs", { listing });
}));

//Update Route
router.put("/:id",isLoggedIn,validatelisting, wrapAsync(async (req, res) => {

  if (!req.body.listing) {
    throw new ExpressError(400, "Send Valid data for listing");
  }

  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  req.flash("success","Listing Updated");
  res.redirect(`/listings/${id}`);
}));

//Delete Route 
router.delete("/:id",isLoggedIn,isOwner,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "list deleted");

    res.redirect("/listings");
  }));

module.exports = router;