const mongoose = require("mongoose");
const { MONGO_URL } = require("./appConstants");

mongoose
  .connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((res) => {
    console.log("Connection Successful");
  })
  .catch((err) => {
    console.log("Some Error Occured");
  });
