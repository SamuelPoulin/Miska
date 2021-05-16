import { injectable } from 'inversify';
import mongoose from 'mongoose';

@injectable()
export default class DatabaseService {
  constructor() {
    this.connect();
  }

  connect(): void {
    mongoose
      .connect(
        `mongodb://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASSWORD}@db/${process.env.MONGO_DB_DATABASE}`,
        {
          authSource: 'admin',
          useNewUrlParser: true,
          useUnifiedTopology: true,
          useFindAndModify: false,
          useCreateIndex: true,
        }
      )
      .then(
        () => console.log('FlashbackService connected to MongoDB.'),
        (err) => console.error(err)
      );
  }

  disconnect(): void {
    mongoose.disconnect();
  }
}
