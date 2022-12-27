import axios from "axios";
import { Attachment, Message } from "discord.js";
import fs from "fs";

import { contentPath } from "../util/constants";

import Soundbite, { ISoundbite } from "../models/soundbite";

export const validateAttachment = (attachment: Attachment) => {
  if (attachment && attachment.name) {
    const splitFilename = attachment.name.split(".");

    if (splitFilename.length === 2 && splitFilename[1] === "mp3") {
      return true;
    }
  }

  return false;
};

export const createSoundbite = async (message: Message) => {
  const attachment = message.attachments.first();

  if (!attachment || !attachment.name || !validateAttachment(attachment)) {
    message.channel.send(`> :x: Try adding an mp3 file as an attachment.`);

    return;
  }

  const splitFilename = attachment.name.split(".");

  const soundbite: ISoundbite = new Soundbite({
    name: splitFilename[0],
    filename: splitFilename[0],
    extension: splitFilename[1],
  });

  try {
    await soundbite.save();

    const stream = await axios.get(attachment.url, { responseType: "stream" });

    const writeStream = fs.createWriteStream(contentPath + attachment.name);

    writeStream.on("finish", () => writeStream.end());

    stream.data.pipe(writeStream);

    return splitFilename[0];
  } catch (e) {
    console.error(e);
    soundbite.remove();

    message.channel.send(`> :x: Could not add the soundbite.`);
  }
};

export const createSoundbiteFromStream = async (name: string, stream: any) => {
  const soundbite = new Soundbite({
    name: name,
    filename: name,
    extension: "mp3",
  } as ISoundbite);

  try {
    await soundbite.save();

    const writeStream = fs.createWriteStream(contentPath + name + ".mp3");

    writeStream.on("finish", () => writeStream.end());

    stream.pipe(writeStream);

    return name;
  } catch (e) {
    console.error(e);

    soundbite.remove();
    throw e;
  }
};

export const deleteSoundbite = async (name: string) => {
  try {
    const soundbite = await Soundbite.findOne({ name });

    if (!soundbite) throw new Error(`Could not find soundbite ${name}.`);

    const path = `${contentPath}${soundbite.filename}.${soundbite.extension}`;

    await fs.promises.rm(path);
    await Soundbite.deleteOne({ name });
  } catch (e) {
    console.error(e);

    throw e;
  }
};

export const getSoundbite = async (name: string) => {
  try {
    const soundbite = await Soundbite.findOneAndUpdate(
      { name },
      { $inc: { count: 1 } }
    );

    if (!soundbite) return null;

    const path = `${contentPath}${soundbite.filename}.${soundbite.extension}`;
    fs.promises.access(path);

    return path;
  } catch (e) {
    console.error(e);

    throw e;
  }
};

export const getAllSoundbites = async () => {
  return Soundbite.find({}).sort({ count: "desc" });
};
