const express = require("express");
const connectToDb = require("./config/connectToDb")
require("dotenv").config();



//Connect To Db
connectToDb();

//Init app
const app = express()

//Middlewares
app.use(express.json());

//Routes
app.use("/api/auth", require("./routes/authRoute"))
app.use("/api/users", require("./routes/usersRoute"))



//Running the server
const PORT = process.env.PORT; //ou on met 8000
app.listen(PORT, () => 
    console.log(
        `Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`
    )
);