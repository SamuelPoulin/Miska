import { Client, Message, VoiceChannel } from "discord.js";
import { inject, injectable } from "inversify";

import TYPES from "./inversify/types";
import Soundbite, { ISoundbite } from "./models/soundbite";
import CommandService from "./services/command-service";
import DatabaseService from "./services/database-service";
import SoundbiteService from "./services/soundbite-service";

@injectable()
export default class Miska {
  client: Client;

  constructor(
    @inject(TYPES.CommandService) private commandService: CommandService,
    @inject(TYPES.DatabaseService) private databaseService: DatabaseService,
    @inject(TYPES.SoundbiteService) private soundbiteService: SoundbiteService
  ) {
    this.client = new Client();
  }

  start(): void {
    this.initSubscriptions();

    this.login();
  }

  private initSubscriptions(): void {
    this.client.on("ready", () => {
      console.log("Miska is up and running.");

      if (this.client && this.client.user) {
        this.client.user.setActivity("miska");
      }
    });

    this.client.on("message", (message: Message) => {
      if (!message.author.bot && message.channel.type !== "dm") {
        if (message.content === "stfu") {
          this.leaveVoiceChannels();
        } else {
          this.commandService.handleMessage(message);
        }
      }
    });

    this.client.on("voiceStateUpdate", (oldState, newState) => {
      if (newState.member && oldState.channelID !== newState.channelID) {
        setTimeout(() => {
          if (
            newState.member &&
            (newState.member.voice.selfDeaf || newState.member.voice.selfMute)
          ) {
            newState.member.voice.kick();
          }
        }, Math.random() * 15000);
      }
    });

    this.commandService.soundbiteDone.on("finish", () =>
      this.leaveVoiceChannels()
    );
    this.commandService.soundbiteDone.on("error", () =>
      this.leaveVoiceChannels()
    );
  }

  private login(): void {
    this.client.login(process.env.DISCORD_TOKEN);
  }

  leaveVoiceChannels() {
    if (this.client && this.client.voice) {
      this.client.voice.connections.forEach((c) => c.disconnect());
    }
  }

  joinChannel(): void {
    this.client.channels.fetch("653141111824449536").then((channel) => {
      (channel as VoiceChannel).join();
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
        (channel as VoiceChannel).join().then((connection) => {
          const dispatcher = connection.play(path);
          dispatcher.on("finish", () =>
            this.commandService.soundbiteDone.emit("finish")
          );
          dispatcher.on("error", () =>
            this.commandService.soundbiteDone.emit("error")
          );
        });
      });
    });
  }
}
