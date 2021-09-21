import { injectable } from 'inversify';
import { Message, MessageAttachment } from 'discord.js';
import fs from 'fs';
import axios from 'axios';

import Flashback, { IFlashback } from '../models/flashback';

export interface FlashbackFile {
  path: string;
  file: string;
}

@injectable()
export default class FlashbackService {
  readonly validFlashbackExtensions: string[] = ['jpg', 'png', 'gif'];

  contentPath: string;

  constructor() {
    this.contentPath = process.env.MISKA_CONTENT_PATH + 'picture/';
  }

  createFlashback(message: Message): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const attachment = message.attachments.first();

      if (
        attachment &&
        attachment.name &&
        this.validateAttachment(attachment)
      ) {
        const splitFilename = attachment.name.split('.');

        const flashback = new Flashback({
          name: splitFilename[0],
          filename: splitFilename[0],
          extension: splitFilename[1],
        } as IFlashback);

        flashback
          .save()
          .then(() => {
            axios
              .get(attachment.url, { responseType: 'stream' })
              .then((response) => {
                try {
                  const writeStream = fs.createWriteStream(
                    this.contentPath + attachment.name
                  );

                  const writeCompleted = () => {
                    writeStream.end();
                    resolve(splitFilename[0]);
                  };

                  writeStream.on('finish', () => writeCompleted());

                  response.data.pipe(writeStream);
                } catch (e) {
                  flashback.remove();
                  reject(e);
                }
              })
              .catch((e) => {
                flashback.remove();
                reject(e);
              });
          })
          .catch((e) => reject(e));
      } else {
        reject();
      }
    });
  }

  deleteFlashback(name: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      Flashback.findOne({ name })
        .then((flashback) => {
          if (flashback) {
            fs.rm(
              `${this.contentPath}${flashback.filename}.${flashback.extension}`,
              (err) => {
                if (err) {
                  reject(err);
                } else {
                  Flashback.deleteOne({ name })
                    .then(() => resolve())
                    .catch((e) => reject(e));
                }
              }
            );
          } else {
            reject();
          }
        })
        .catch((e) => reject(e));
    });
  }

  getFlashback(name: string): Promise<FlashbackFile> {
    return new Promise<FlashbackFile>((resolve, reject) => {
      Flashback.findOneAndUpdate({ name }, { $inc: { count: 1 } })
        .then((flashback) => {
          if (flashback) {
            const file = `${flashback.filename}.${flashback.extension}`;
            const path = this.contentPath + file;
            fs.access(path, (err) => {
              if (err) {
                reject(err);
              } else {
                resolve({ path: path, file: file });
              }
            });
          } else {
            reject();
          }
        })
        .catch((e) => reject(e));
    });
  }

  getAllFlashbacks(): Promise<IFlashback[]> {
    return new Promise<IFlashback[]>((resolve, reject) => {
      Flashback.find({})
        .sort({ count: 'desc' })
        .then((flashbacks) => {
          resolve(flashbacks);
        })
        .catch((e) => reject(e));
    });
  }

  private validateAttachment(attachment: MessageAttachment): boolean {
    if (attachment && attachment.name) {
      const splitFilename = attachment.name.split('.');

      if (
        splitFilename.length === 2 &&
        this.validFlashbackExtensions.includes(splitFilename[1])
      ) {
        return true;
      }
    }

    return false;
  }
}
