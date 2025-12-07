const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("API running"));

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/diet", require("./routes/dietRoutes"));
app.use("/api/progress", require("./routes/progressRoutes"));
// you can add workoutRoutes, userRoutes similarly

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
