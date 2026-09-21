const { required } = require("joi");
const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const Review=require("./review.js");

const listingSchema = new mongoose.Schema({
    title: String,
    description: String,
    image: {
        filename: String,
        url: String
    },
    price: Number,
    location: String,
    country: String,
    category: {
        type: String,
        enum: [
            "Mountains",
            "Deserts",
            "Iconic Cities",
            "Farms",
            "Arctic",
            "Beaches",
            "Forests",
            "Islands",
            "Camping",
            "Castles",
            "Countryside",
            "Historical"
        ]
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review"
        }
    ],
    geometry: {
        type: {
            type: String,
            enum: ["Point"],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
});

listingSchema.post("findOneAndDelete", async(listing)=>{
if(listing){
    await Review.deleteMany({ _id: { $in:listing.reviews}});
}
});

const Listing=mongoose.model("Listing",listingSchema);
module.exports = Listing;


