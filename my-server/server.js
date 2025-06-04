require('dotenv').config();
const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const connectDB = require("./config/db");
const { initializeProducts } = require("./controllers/product");
const limiter = require("./middlewares/limiter");
const { initializeAnnounces } = require("./controllers/announce");

app.use('/api/uploads', express.static('uploads'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json()); //an express middleware to allow json in request body

app.get("/api", (req, res) => {
    res.send("Hello World!")
})

//limiter({max:30, reset: 5*1000})
app.use("/api/user", require("./routers/user"));
app.use("/api/product" ,require("./routers/product"));
app.use("/api/announce" ,require("./routers/announce"));
app.use("/api/payment" ,require("./routers/payment"));

const startServer = async () => {
    try {
        await connectDB()
        console.log("mongoose connection successfull")
        await initializeProducts()
        await initializeAnnounces()
        console.log("Variables initialized")
        await app.listen(process.env.PORT)
        return `Express server is listening ${process.env.PORT}`;
    } catch (error) {
        throw error;
    }
}

startServer().then(v => console.log(v));
