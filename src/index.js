const express = require("express");
require("dotenv").config();
const videoRouter = require("./controllers/video");
const authMiddleware = require("./middleware/auth");
const port = process.env.PORT || 3000;

const app = express();

app.use(express.json());

app.use("/api/videos", authMiddleware, videoRouter);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
