const express = require("express");
const cors = require("cors");
const session = require("express-session");
const routes = require("./routes");
require("dotenv").config();

const app = express();
const database = require("./database");

app.use(express.json());
app.use(cors);
app.use(session({ secret: "foo", resave: false, saveUninitialized: false }));

app.use("/api", routes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server listening on port", PORT));
