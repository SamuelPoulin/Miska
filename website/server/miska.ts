import { createReadStream } from "fs";

import {
  AudioPlayer,
  AudioPlayerStatus,
  AudioResource,
  createAudioPlayer,
  createAudioResource,
  DiscordGatewayAdapterCreator,
  getVoiceConnections,
  joinVoiceChannel,
  VoiceConnection,
} from "@discordjs/voice";

import {
  ChannelType,
  Client,
  GatewayIntentBits,
  Message,
  VoiceChannel,
  VoiceState,
} from "discord.js";

import ytdl from "@distube/ytdl-core";

import {
  createSoundbite,
  deleteSoundbite,
  createSoundbiteFromStream,
  getAllSoundbites,
  getSoundbite,
} from "./services/soundbite";
import { connectDatabase } from "./services/database";

import { joinChannelId, listenChannelId } from "./util/constants";

const client = new Client({
  intents: [
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
  ],
});

const player: AudioPlayer = createAudioPlayer();

const init = () => {
  connectDatabase();
  initSubscriptions();

  login();
};

const login = () => {
  client.login(process.env.DISCORD_TOKEN);
};

const initSubscriptions = () => {
  player.on(AudioPlayerStatus.Idle, leaveVoiceChannels);
  player.on("error", console.error);

  client.on("ready", () => {
    if (!client || !client.user) return;

    console.log("Miska is up and running.");

    client.user.setActivity("miska");
  });

  client.on("messageCreate", handleMessage);
};

const handleMessage = async (message: Message) => {
  if (
    message.author.bot ||
    message.channel.type === ChannelType.DM ||
    message.channel.id != listenChannelId
  )
    return;

  if (message.content === "stfu") {
    leaveVoiceChannels();
  } else if (message.content.includes("soundbites")) {
    handleSoundbitesMessage(message);
  } else if (message.content.includes("youtube")) {
    handleYoutubeMessage(message);
  } else if ((message.content.match(/ /g) || []).length == 0) {
    handleRegularMessage(message);
  }
};

const handleSoundbitesMessage = async (message: Message) => {
  const splitContent = message.content.split(" ");

  if (splitContent.length == 1) {
    try {
      const soundbites = await getAllSoundbites();

      if (soundbites.length === 0) {
        message.channel.send("> :x: There are no soundbites.");

        return;
      }

      const messages = [];
      const maxLength = 2000;

      let currentMessage = "";

      for (let soundbite of soundbites) {
        const line = `:arrow_forward: **${soundbite.count}**\t\`${soundbite.name}\`\n`;

        if ((currentMessage + line).length >= maxLength) {
          messages.push(currentMessage);

          currentMessage = "";
        }

        currentMessage += line;
      }

      messages.push(currentMessage);

      for (let soundbiteMessage of messages) {
        message.channel.send(soundbiteMessage);
      }
    } catch (e) {
      console.error(e);
      message.channel.send("> :x: Could not retrieve the list of soundbites.");
    }
  } else if (splitContent[1] == "delete" || splitContent[1] == "remove") {
    try {
      await deleteSoundbite(splitContent[2]);

      message.channel.send(
        `> :white_check_mark: Successfully purged \`${splitContent[2]}\` from the soundbites.`
      );
    } catch (e) {
      console.error(e);
      message.channel.send(`> :x: Could not purge the soundbite.`);
    }
  } else if (splitContent[1] == "add" || splitContent[1] == "insert") {
    try {
      const name = await createSoundbite(message);

      message.channel.send(
        `> :white_check_mark: Successfully added \`${name}\` to the soundbites.`
      );
    } catch (e) {
      console.error(e);
      message.channel.send(`> :x: Could not add the soundbite.`);
    }
  }
};

const handleYoutubeMessage = async (message: Message) => {
  const splitContent = message.content.split(" ");

  if (
    !ytdl.validateURL(splitContent[0]) ||
    !message.member?.voice?.channel ||
    !message.guild
  ) {
    return;
  }

  const parameters =
    splitContent.length == 1
      ? { url: splitContent[0], name: null }
      : { url: splitContent[0], name: splitContent[1] };

  const video = ytdl(parameters.url, { filter: "audioonly" });
  const resource = createAudioResource(video);

  const connection = joinVoiceChannel({
    channelId: message.member.voice.channel.id,
    guildId: message.guild.id,
    adapterCreator: message.guild.voiceAdapterCreator,
  });

  playResource(connection, resource);

  if (!parameters.name) return;

  try {
    await createSoundbiteFromStream(parameters.name, video);

    message.channel.send(
      `> :white_check_mark: Successfully added \`${parameters.name}\` to the soundbites.`
    );
  } catch (err) {
    message.channel.send(`> :x: Could not add the soundbite.`);
    console.error(err);
  }
};

const handleRegularMessage = async (message: Message) => {
  try {
    const soundbite = await getSoundbite(message.content);

    if (!soundbite || !message.member?.voice?.channel || !message.guild) return;

    const connection = joinVoiceChannel({
      channelId: message.member.voice.channel.id,
      guildId: message.guild?.id,
      adapterCreator: message.guild
        ?.voiceAdapterCreator as DiscordGatewayAdapterCreator,
    });

    const resource = createAudioResource(createReadStream(soundbite));

    playResource(connection, resource);
  } catch (e) {
    console.error(e);
  }
};

const playResource = (connection: VoiceConnection, resource: AudioResource) => {
  connection.subscribe(player);

  player.play(resource);
};

const leaveVoiceChannels = () => {
  getVoiceConnections().forEach((voiceConnection) => voiceConnection.destroy());
};

const joinChannel = async () => {
  const channel = await client.channels.fetch(joinChannelId);

  if (!channel) return;

  joinVoiceChannel({
    channelId: (channel as VoiceChannel).id,
    guildId: (channel as VoiceChannel).guild.id,
    adapterCreator: (channel as VoiceChannel).guild
      .voiceAdapterCreator as DiscordGatewayAdapterCreator,
  });
};

const playSoundbite = async (name: string) => {
  try {
    const path = await getSoundbite(name);
    if (!path) return;

    const channel = await client.channels.fetch(joinChannelId);
    if (!channel) return;

    const connection = joinVoiceChannel({
      channelId: (channel as VoiceChannel).id,
      guildId: (channel as VoiceChannel).guild.id,
      adapterCreator: (channel as VoiceChannel).guild
        .voiceAdapterCreator as DiscordGatewayAdapterCreator,
    });

    const ressource = createAudioResource(createReadStream(path));

    playResource(connection, ressource);
  } catch (e) {
    console.error(e);
  }
};

export default {
  init,
  getAllSoundbites,
  joinChannel,
  playSoundbite,
  leaveVoiceChannels,
  createSoundbiteFromStream,
  deleteSoundbite,
};
