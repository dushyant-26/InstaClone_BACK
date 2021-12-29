const express = require("express");
const app = express();
const { PORT } = require("./appConstants");
const authrouter = require("./routes/authRoutes");
const postrouter = require("./routes/postRoutes");
const userrouter = require("./routes/userRoutes");
const cors = require("cors");

app.use(express.json());
app.use(cors());
require("./mongoConn");
app.use(authrouter);
app.use(postrouter);
app.use(userrouter);

app.listen(PORT, () => {
  console.log(`Listening to port ${PORT}`);
});
