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
} from "discord.js";
import { inject, injectable } from "inversify";
import ytdl from "ytdl-core";
import { createReadStream } from "fs";

import TYPES from "./inversify/types";
import Soundbite, { ISoundbite } from "./models/soundbite";
import DatabaseService from "./services/database-service";
import SoundbiteService from "./services/soundbite-service";

@injectable()
export default class Miska {
  client: Client;
  player: AudioPlayer;

  constructor(
    @inject(TYPES.DatabaseService) private databaseService: DatabaseService,
    @inject(TYPES.SoundbiteService) public soundbiteService: SoundbiteService
  ) {
    this.client = new Client({
      intents: [
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent,
      ],
    });

    this.player = createAudioPlayer();
    this.player.on(AudioPlayerStatus.Idle, () => {
      this.leaveVoiceChannels();
    });
    this.player.on("error", (error) => {
      console.error(error);
    });
  }

  start(): void {
    this.initSubscriptions();

    this.login();
  }

  private playResource(connection: VoiceConnection, resource: AudioResource) {
    connection.subscribe(this.player);

    this.player.play(resource);
  }

  private initSubscriptions(): void {
    this.client.on("ready", () => {
      console.log("Miska is up and running.");

      if (this.client && this.client.user) {
        this.client.user.setActivity("miska");
      }
    });

    this.client.on("messageCreate", async (message: Message) => {
      if (
        message.author.bot ||
        message.channel.type === ChannelType.DM ||
        message.channel.id != "452338796776652811"
      )
        return;

      if (message.content === "stfu") {
        this.leaveVoiceChannels();
      } else if (message.content.includes("soundbites")) {
        const splitContent = message.content.split(" ");

        if (splitContent.length == 1) {
          this.soundbiteService.getAllSoundbites().then((soundbites) => {
            let text = "";

            for (const soundbite of soundbites) {
              text += `> :outbox_tray: **${soundbite.count}**\t\`${soundbite.name}\`\n\n`;
            }

            message.channel.send(text);
          });
        } else if (splitContent[1] == "delete" || splitContent[1] == "remove") {
          this.soundbiteService
            .deleteSoundbite(splitContent[2])
            .then(() => {
              message.channel.send(
                `> :white_check_mark: Successfully purged \`${splitContent[2]}\` from the soundbites.`
              );
            })
            .catch((e) => {
              message.channel.send(`> :x: Could not purge the soundbite.`);
              console.error(e);
            });
        } else if (splitContent[1] == "add" || splitContent[1] == "insert") {
          this.soundbiteService
            .createSoundbite(message)
            .then((name) => {
              message.channel.send(
                `> :white_check_mark: Successfully added \`${name}\` to the soundbites.`
              );
            })
            .catch((e) => {
              message.channel.send(`> :x: Could not add the soundbite.`);
              console.error(e);
            });
        }
      } else if (message.content.includes("youtube")) {
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


        this.playResource(connection, resource);

        if (!parameters.name) return;

        try {
          await this.soundbiteService.createSoundbiteFromStream(
            parameters.name,
            video
          );

          message.channel.send(
            `> :white_check_mark: Successfully added \`${parameters.name}\` to the soundbites.`
          );
        } catch (err) {
          message.channel.send(`> :x: Could not add the soundbite.`);
          console.error(err);
        }
      } else if ((message.content.match(/ /g) || []).length == 0) {
        const soundbite = await this.soundbiteService.getSoundbite(
          message.content
        );

        if (!soundbite || !message.member?.voice?.channel || !message.guild)
          return;

        const connection = joinVoiceChannel({
          channelId: message.member.voice.channel.id,
          guildId: message.guild?.id,
          adapterCreator: message.guild
            ?.voiceAdapterCreator as DiscordGatewayAdapterCreator,
        });

        const resource = createAudioResource(createReadStream(soundbite));

        this.playResource(connection, resource);
      }
    });

    this.client.on("voiceStateUpdate", (oldState, newState) => {
      if (newState.member && oldState.channelId !== newState.channelId) {
        setTimeout(() => {
          if (
            newState.member &&
            !newState.member.user.bot &&
            (newState.member.voice.selfDeaf || newState.member.voice.selfMute)
          ) {
            newState.member.voice.disconnect();
          }
        }, Math.random() * 15000);
      }
    });
  }

  private login(): void {
    this.client.login(process.env.DISCORD_TOKEN);
  }

  leaveVoiceChannels() {
    getVoiceConnections().forEach((voiceConnection) =>
      voiceConnection.destroy()
    );
  }

  joinChannel(): void {
    this.client.channels.fetch("653141111824449536").then((channel) => {
      if (channel) {
        joinVoiceChannel({
          channelId: (channel as VoiceChannel).id,
          guildId: (channel as VoiceChannel).guild.id,
          adapterCreator: (channel as VoiceChannel).guild
            .voiceAdapterCreator as DiscordGatewayAdapterCreator,
        });
      }
    });
  }

  getSoundBites(): Promise<ISoundbite[]> {
    return new Promise<ISoundbite[]>((resolve, reject) => {
      Soundbite.find({}).then((soundbites) => {
        resolve(soundbites);
      });
    });
  }

  playSoundbite(name: string) {
    this.soundbiteService.getSoundbite(name).then((path) => {
      this.client.channels.fetch("653141111824449536").then((channel) => {
        if (channel) {
          const connection = joinVoiceChannel({
            channelId: (channel as VoiceChannel).id,
            guildId: (channel as VoiceChannel).guild.id,
            adapterCreator: (channel as VoiceChannel).guild
              .voiceAdapterCreator as DiscordGatewayAdapterCreator,
          });

          const ressource = createAudioResource(createReadStream(path));

          this.playResource(connection, ressource);
        }
      });
    });
  }

  deleteSoundbite(name: string) {
    this.soundbiteService.deleteSoundbite(name);
  }
}
