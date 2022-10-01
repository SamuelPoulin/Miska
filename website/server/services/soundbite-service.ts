import axios from 'axios';
import { Attachment, Message} from 'discord.js';
import { injectable } from 'inversify';
import Soundbite, { ISoundbite } from '../models/soundbite';
import fs from 'fs';

@injectable()
export default class SoundbiteService {
  contentPath: string;
  
  constructor() {
    this.contentPath = process.env.MISKA_CONTENT_PATH + 'audio/';
  }
  
  createSoundbite(message: Message): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const attachment = message.attachments.first();
      
      if (
        attachment &&
        attachment.name &&
        this.validateAttachment(attachment)
        ) {
          const splitFilename = attachment.name.split('.');
          
          const soundbite = new Soundbite({
            name: splitFilename[0],
            filename: splitFilename[0],
            extension: splitFilename[1],
          } as ISoundbite);
          
          soundbite
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
                  soundbite.remove();
                  reject(e);
                }
              })
              .catch((e) => {
                soundbite.remove();
                reject(e);
              });
            })
            .catch((e) => reject(e));
          } else {
            reject();
          }
        });
      }
      
      createSoundbiteFromStream(name: string, stream: any): Promise<string> {
        return new Promise<string>((resolve, reject) => {
          const soundbite = new Soundbite({
            name: name,
            filename: name,
            extension: 'mp3',
          } as ISoundbite);
          
          soundbite
          .save().catch((e) => reject(e))
          .then(() => {
            try {
              const writeStream = fs.createWriteStream(
                this.contentPath + name + '.mp3'
                );
                
                const writeCompleted = () => {
                  writeStream.end();
                  resolve(name);
                };
                
                writeStream.on('finish', () => writeCompleted());
                
                stream.pipe(writeStream);
              } catch (e) {
                soundbite.remove();
                reject(e);
              }
            })
            .catch((e) => {
              soundbite.remove();
              reject(e);
            });
          });
        }
        
        deleteSoundbite(name: string): Promise<void> {
          return new Promise<void>((resolve, reject) => {
            Soundbite.findOne({ name })
            .then((soundbite) => {
              if (soundbite) {
                fs.rm(
                  `${this.contentPath}${soundbite.filename}.${soundbite.extension}`,
                  (err) => {
                    if (err) {
                      reject(err);
                    } else {
                      Soundbite.deleteOne({ name })
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
          
          getSoundbite(name: string): Promise<string> {
            return new Promise<string>((resolve, reject) => {
              Soundbite.findOneAndUpdate({ name }, { $inc: { count: 1 } })
              .then((soundbite) => {
                if (soundbite) {
                  const path = `${this.contentPath}${soundbite.filename}.${soundbite.extension}`;
                  fs.access(path, (err) => {
                    if (err) {
                      reject(err);
                    } else {
                      resolve(path);
                    }
                  });
                } else {
                  reject();
                }
              })
              .catch((e) => reject(e));
            });
          }
          
          getAllSoundbites(): Promise<ISoundbite[]> {
            return new Promise<ISoundbite[]>((resolve, reject) => {
              Soundbite.find({})
              .sort({ count: 'desc' })
              .then((soundbites) => {
                resolve(soundbites);
              })
              .catch((e) => reject(e));
            });
          }
          
          private validateAttachment(attachment: Attachment): boolean {
            if (attachment && attachment.name) {
              const splitFilename = attachment.name.split('.');
              
              if (splitFilename.length === 2 && splitFilename[1] === 'mp3') {
                return true;
              }
            }
            
            return false;
          }
        }
        