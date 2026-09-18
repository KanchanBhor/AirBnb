const mongoose = require("mongoose");

const initData = require("./data.js");
const Listing = require("../models/listing.js");

main()
    .then(() => {
        console.log("connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/wonderlust");
}

const initDB = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj)=>({
           ...obj,owner:'6a9d3ad16e9c28e05c3913c5'
    }));
    await Listing.insertMany(initData.data);
    console.log("Data was initialized");
};

initDB();