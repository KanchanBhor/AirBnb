const Listing = require("../models/listing.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

// INDEX
module.exports.index = async (req, res) => {
  const {category}=req.query;
  let allListings;
  if(category){
    allListings= await Listing.find({category});
  }else{
    allListings=await Listing.find({});
  }
  res.render("listings/index.ejs", { allListings });
};

// NEW FORM
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

// SHOW
module.exports.showListing = async (req, res) => {
  let { id } = req.params;

  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author"
      }
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing you requested does not exist!!");
    return res.redirect("/listings");
  }

  res.render("listings/show.ejs", {
    listing,
    mapToken: process.env.MAP_TOKEN
  });
};

// CREATE
module.exports.createListing = async (req, res, next) => {
  console.log("BODY:", req.body);
  console.log("FILE:", req.file);

  let response = await geocodingClient.forwardGeocode({
    query: req.body.listing.location,
    limit: 1
  }).send();

  if (!response.body.features.length) {
    req.flash("error", "Location not found!");
    return res.redirect("/listings/new");
  }

  const newListing = new Listing(req.body.listing);

  newListing.owner = req.user._id;

  if (req.file) {
    newListing.image = {
      url: req.file.path,
      filename: req.file.filename
    };
  }

  newListing.geometry = response.body.features[0].geometry;

  const savedListing = await newListing.save();

  console.log("SAVED:", savedListing);

  req.flash("success", "New listing Created!");
  res.redirect("/listings");
};

// EDIT FORM
module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;

  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing you requested does not exist!!");
    return res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");

  res.render("listings/edit.ejs", {
    listing,
    originalImageUrl
  });
};

// UPDATE
module.exports.updateListing = async (req, res) => {
  let { id } = req.params;

  let listing = await Listing.findByIdAndUpdate(
    id,
    { ...req.body.listing },
    { new: true }
  );

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;

    listing.image = {
      url,
      filename
    };

    await listing.save();
  }

  req.flash("success", "Listing Updated!");
  res.redirect("/listings");
};

// DELETE
module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;

  let deleteListing = await Listing.findByIdAndDelete(id);

  console.log(deleteListing);

  req.flash("success", "Listing deleted!");
  res.redirect("/listings");
};