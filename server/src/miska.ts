import { Client, Message } from 'discord.js';
import { inject, injectable } from 'inversify';

import TYPES from './inversify/types';
import CommandService from './services/command-service';
import DatabaseService from './services/database-service';

@injectable()
export default class Miska {
  client: Client;

  constructor(
    @inject(TYPES.CommandService) private commandService: CommandService,
    @inject(TYPES.DatabaseService) private databaseService: DatabaseService
  ) {
    this.client = new Client();
  }

  start(): void {
    this.initSubscriptions();

    this.login();
  }

  private initSubscriptions(): void {
    this.client.on('ready', () => {
      console.log('Miska is up and running.');

      if (this.client && this.client.user) {
        this.client.user.setActivity('miska');
      }
    });

    this.client.on('message', (message: Message) => {
      if (!message.author.bot && message.channel.type !== 'dm') {
        if (message.content === 'stfu') {
          this.leaveVoiceChannels();
        } else {
          this.commandService.handleMessage(message);
        }
      }
    });

    this.client.on('voiceStateUpdate', (oldState, newState) => {
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

    this.commandService.soundbiteDone.on('finish', () =>
      this.leaveVoiceChannels()
    );
    this.commandService.soundbiteDone.on('error', () =>
      this.leaveVoiceChannels()
    );
  }

  private login(): void {
    this.client.login(process.env.DISCORD_TOKEN);
  }

  private leaveVoiceChannels() {
    if (this.client && this.client.voice) {
      this.client.voice.connections.forEach((c) => c.disconnect());
    }
  }
}
