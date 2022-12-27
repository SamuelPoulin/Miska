import mongoose from "mongoose";

import { mongoUrl } from "../util/constants";

export const connectDatabase = async () => {
  try {
    await mongoose.connect(mongoUrl, {
      authSource: "admin",
    });

    console.log("Connected to MongoDB.");
  } catch (e) {
    console.error(e);
  }
};

export const disconnectDatabase = async () => {
  await mongoose.disconnect();
};
