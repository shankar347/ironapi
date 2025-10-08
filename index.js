import express from "express";
import cors from "cors";
import cookieparser from "cookie-parser";
import mongoose from "mongoose";
import helmet from "helmet";
import userRouter from "./routes/userroutes.js";
import orderRouter from "./routes/orderroutes.js";
import TransactionRouter from "./routes/transactionroutes.js";
import AdminRouter from "./routes/adminroutes.js";

import dotenv from "dotenv";
import connectDB from "./helper/connectDb.js";

const app = express();

dotenv.config();
// app.use(dotenv.config())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(
  cors({
    origin:['https://ironweb-5isiqzn47-shankar347s-projects.vercel.app',
    'https://ironweb.vercel.app',
    'http://localhost:8080'
    ] ,// frontend URL
    credentials: true, // allow cookies
  })
);
app.use(cookieparser());

//routes

app.use("/api/v1/user", userRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/admin",AdminRouter );
app.use("/api/v1/transactions", TransactionRouter);


await connectDB()

app.listen(process.env.PORT, () => {
  console.log("Server is running on ", process.env.PORT);
});
