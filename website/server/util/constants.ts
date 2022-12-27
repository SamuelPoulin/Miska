export const mongoUrl = `mongodb://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASSWORD}@db/${process.env.MONGO_DB_DATABASE}`;
export const contentPath = process.env.MISKA_CONTENT_PATH + "audio/";

// TODO: Move to database to enable persistent configuration
export const listenChannelId = "452338796776652811";
export const joinChannelId = "653141111824449536";
