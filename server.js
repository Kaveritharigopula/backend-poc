require("dotenv").config();

const express =
  require("express");

const cors =
  require("cors");

const connectDB =
  require("./config/db");

const authRoutes =
  require("./routes/authRoutes");

const app = express();

connectDB();

app.use(
  cors({
    origin:
      "http://localhost:3000",
  })
);

app.use(express.json());

app.use(
  "/api/auth",
  authRoutes
);

app.get("/", (req, res) => {
  res.send(
    "Authentication API Running"
  );
});

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `✅ Server Running On Port ${PORT}`
  );
});