const express=require("express");
const router = express.Router();
const User=require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport=require("passport");
const { saveRedirectUrl, isLoggedIn } = require("../middleware.js");

const userController=require("../controllers/users.js");
const Booking = require("../models/booking.js");

router
.route("/signup")
.get(userController.renderSignupForm)
.post(wrapAsync(userController.signup)
);

router
.route("/login")
.get(userController.renderLoginForm)
.post(
    saveRedirectUrl,
    passport.authenticate(
        "local",{
            failureRedirect:"/login",
            failureFlash:true
      }),
 userController.login);


router.get("/logout",userController.logout);

router.get("/wishlist",isLoggedIn,async(req,res)=>{
    const user=await User.findById(req.user._id).populate("wishlist");

    res.render("users/wishlist.ejs",{
        wishlist:user.wishlist
    });
});

router.get("/bookings", isLoggedIn, async (req, res) => {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("listing")
      .sort({ createdAt: -1 });
  
    res.render("users/bookings.ejs", { bookings });
  });
module.exports=router;

