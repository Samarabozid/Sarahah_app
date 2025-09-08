import 'dotenv/config';
import express from 'express';
import userRouter from './Modules/Users/user.controller.js';
import messageRouter from './Modules/Messages/message.controller.js';
import dbConnection from './DB/db.connection.js';

const app = express();

app.use(express.json());

dbConnection();

app.use("/api/users", userRouter);
app.use("/api/messages", messageRouter);


// error handling middleware
app.use(async (err, req, res, next) => {
  console.log(err.stack);

  console.log("Session in error handling middleware:",req.session);

  if (req.session && req.session.inTransaction()) {

    // abort transaction
    await req.session.abortTransaction();

    // end session
    req.session.endSession();

    console.log("The Transaction has been aborted");
  }
  res.status(err.cause || 500).json({ message: "Internal Server Error", err: err.message, stack: err.stack });
})

app.use((req, res) => {
  res.status(404).json({ message: "Not Found" });
})

app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});
