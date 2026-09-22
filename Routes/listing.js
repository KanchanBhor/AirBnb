const express=require("express");
const router =express.Router();
const Listing = require("../models/listing.js");
const wrapAsync= require("../utils/wrapAsync.js");
const {isLoggedIn, isOwner,validateListing}=require("../middleware.js");

const listingController=require("../controllers/listings.js");
const User = require("../models/user.js");
const Booking = require("../models/booking.js");
const multer=require("multer");
const { storage }=require("../cloudConfig.js");
const upload=multer({storage});

 //search route 
 router.get("/search", async (req, res) => {
  let { category } = req.query;

  let allListings = await Listing.find({
      category: { $regex: category, $options: "i" }
  });

  res.render("listings/index.ejs", { allListings });
});


router
.route("/")
.get( wrapAsync (listingController.index))
.post(
  isLoggedIn,
  upload.single("listing[image]"),
  validateListing,
  wrapAsync(listingController.createListing)
);

//NEW route
  
router.get("/new",isLoggedIn,listingController.renderNewForm);

router.post("/:id/wishlist",isLoggedIn,async(req,res) =>{
  const{id}=req.params;
  const user=await User.findById(req.user._id);
  const alreadySaved = user.wishlist.includes(id);
  
  if(alreadySaved){
    user.wishlist.pull(id);
  }else{

    user.wishlist.push(id);
  }
  await user.save();
  res.redirect(`/listings/${id}`);
});

router.post("/:id/book", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const { checkIn, checkOut, guests } = req.body;

  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  const start = new Date(checkIn);
  const end = new Date(checkOut);

  const nights = (end - start) / (1000 * 60 * 60 * 24);

  if (nights <= 0) {
    req.flash("error", "Check-out must be after check-in!");
    return res.redirect(`/listings/${id}`);
  }

  const totalPrice = nights * listing.price;

  const booking = new Booking({
    listing: id,
    user: req.user._id,
    checkIn,
    checkOut,
    guests,
    totalPrice
  });

  await booking.save();

  req.flash("success", "Booking confirmed! 🎉");
  res.redirect(`/listings/${id}`);
});

router
.route("/:id")
.get(wrapAsync(listingController.showListing))
.put(
  isLoggedIn,
  isOwner,
  upload.single("listing[image]"),
  validateListing,
   wrapAsync(listingController.updateListing))
.delete(
   isLoggedIn,isOwner,
   wrapAsync(listingController.destroyListing));
  

  //edit route
  router.get("/:id/edit", 
  isLoggedIn, isOwner,
  wrapAsync (listingController.renderEditForm));

 
  
module.exports=router;

