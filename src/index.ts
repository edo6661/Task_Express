import express from "express";
import dotenv from "dotenv";
dotenv.config();
const app = express();

app.get("/", (req, res) => {
  res.send("maaf ya bang");
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`ya maaf ya bang  ${PORT}`);
});
