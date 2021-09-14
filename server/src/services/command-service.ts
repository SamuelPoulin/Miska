import EventEmitter from 'events';
import { Message } from 'discord.js';
import { inject, injectable } from 'inversify';
import _ from 'lodash';
import ytdl from 'ytdl-core';

import { messages } from '../messages';
import FlashbackService from './flashback-service';
import SoundbiteService from './soundbite-service';
import TYPES from '../inversify/types';

@injectable()
export default class CommandService {
  soundbiteDone: EventEmitter;

  constructor(
    @inject(TYPES.FlashbackService) private flashbackService: FlashbackService,
    @inject(TYPES.SoundbiteService) private soundbiteService: SoundbiteService
  ) {
    this.soundbiteDone = new EventEmitter();
  }

  handleMessage(message: Message): void {
    const splitMessage = message.content.toLowerCase().split(' ');
    const nextArguments = _.drop(splitMessage);

    switch (_.first(splitMessage)) {
      case 'miska':
      case 'm':
        this.miska(message, nextArguments);
        break;
    }
  }

  private miska(message: Message, previousArguments: string[]): void {
    const nextArguments = _.drop(previousArguments);

    switch (_.first(previousArguments)) {
      case 'flashback':
      case 'f':
        this.flashback(message, nextArguments);
        break;
      case 'soundbite':
      case 's':
        this.soundbite(message, nextArguments);
        break;
      default:
        message.channel.send(messages.miska.message);
        break;
    }
  }

  private flashback(message: Message, previousArguments: string[]): void {
    const nextArguments = _.drop(previousArguments);

    switch (_.first(previousArguments)) {
      case 'inject':
      case 'i':
        this.injectFlashback(message);
        break;
      case 'purge':
        this.purgeFlashback(message, nextArguments);
        break;
      case 'remember':
      case 'r':
        this.rememberFlashback(message, nextArguments);
        break;
      default:
        message.channel.send(messages.miska.flashback.message);
    }
  }

  private injectFlashback(message: Message): void {
    this.flashbackService
      .createFlashback(message)
      .then((name) => {
        message.channel.send(
          `> :white_check_mark: Successfully injected \`${name}\` to the flashbacks.`
        );
      })
      .catch((e) => {
        message.channel.send(`> :x: Could not inject the flashback.`);
        console.error(e);
      });
  }

  private purgeFlashback(message: Message, previousArguments: string[]): void {
    const name = _.first(previousArguments);

    if (name) {
      this.flashbackService
        .deleteFlashback(name)
        .then(() => {
          message.channel.send(
            `> :white_check_mark: Successfully purged \`${name}\` from the flashbacks.`
          );
        })
        .catch((e) => {
          message.channel.send(`> :x: Could not purge the flashback.`);
          console.error(e);
        });
    } else {
      message.channel.send(`> :x: No flashback name was given.`);
    }
  }

  private rememberFlashback(
    message: Message,
    previousArguments: string[]
  ): void {
    const name = _.first(previousArguments);

    if (name) {
      this.flashbackService
        .getFlashback(name)
        .then(({ path, file }) => {
          message.channel.send({ files: [{ attachment: path, name: file }] });
        })
        .catch((e) => {
          message.channel.send(`> :x: Could not remember the flashback.`);
          console.error(e);
        });
    } else {
      this.flashbackService
        .getAllFlashbacks()
        .then((flashbacks) => {
          let text = '';

          for (const flashback of flashbacks) {
            text += `> :outbox_tray: **${flashback.count}**\t\`${flashback.name}\`\n\n`;
          }

          message.channel.send(text);
        })
        .catch((e) => {
          message.channel.send(`> Could not remember the flashbacks.`);
          console.error(e);
        });
    }
  }

  private soundbite(message: Message, previousArguments: string[]): void {
    const nextArguments = _.drop(previousArguments);

    switch (_.first(previousArguments)) {
      case 'inject':
      case 'i':
        this.injectSoundbite(message);
        break;
      case 'purge':
        this.purgeSoundbite(message, nextArguments);
        break;
      case 'remember':
      case 'r':
        this.rememberSoundbite(message, nextArguments);
        break;
      case 'fetch':
      case 'f':
        this.fetchSoundbite(message);
        break;
      default:
        message.channel.send(messages.miska.soundbite.message);
    }
  }

  private injectSoundbite(message: Message): void {
    console.log(message);
    this.soundbiteService
      .createSoundbite(message)
      .then((name) => {
        message.channel.send(
          `> :white_check_mark: Successfully injected \`${name}\` to the soundbites.`
        );
      })
      .catch((e) => {
        message.channel.send(`> :x: Could not inject the soundbite.`);
        console.error(e);
      });
  }

  private purgeSoundbite(message: Message, previousArguments: string[]): void {
    const name = _.first(previousArguments);

    if (name) {
      this.soundbiteService
        .deleteSoundbite(name)
        .then(() => {
          message.channel.send(
            `> :white_check_mark: Successfully purged \`${name}\` from the soundbites.`
          );
        })
        .catch((e) => {
          message.channel.send(`> :x: Could not purge the soundbite.`);
          console.error(e);
        });
    } else {
      message.channel.send(`> :x: No soundbite name was given.`);
    }
  }

  private rememberSoundbite(
    message: Message,
    previousArguments: string[]
  ): void {
    const name = _.first(previousArguments);

    if (name) {
      this.soundbiteService
        .getSoundbite(name)
        .then((path) => {
          if (message.member && message.member.voice.channel) {
            const voiceChannel = message.member.voice.channel;

            if (voiceChannel) {
              voiceChannel.join().then((connection) => {
                const dispatcher = connection.play(path);
                dispatcher.on('finish', () =>
                  this.soundbiteDone.emit('finish')
                );
                dispatcher.on('error', () => this.soundbiteDone.emit('error'));
              });
            }
          }
        })
        .catch((e) => {
          message.channel.send(`> :x: Could not remember the soundbite.`);
          console.error(e);
        });
    } else {
      this.soundbiteService
        .getAllSoundbites()
        .then((soundbites) => {
          let text = '';

          for (const soundbite of soundbites) {
            text += `> :outbox_tray: **${soundbite.count}**\t\`${soundbite.name}\`\n\n`;
          }

          message.channel.send(text);
        })
        .catch((e) => {
          message.channel.send(`> Could not remember the soundbites.`);
          console.error(e);
        });
    }
  }

  private fetchSoundbite(message: Message): void {
    const url = _.last(message.content.split(' '));

    if (url?.match(/\bhttps?::\/\/\S+/gi)) {
      if (message.member && message.member.voice.channel) {
        const voiceChannel = message.member.voice.channel;

        if (voiceChannel) {
          voiceChannel.join().then((connection) => {
            const dispatcher = connection.play(ytdl(url), { volume: 0.5 });
            dispatcher.on('finish', () => this.soundbiteDone.emit('finish'));
            dispatcher.on('error', () => this.soundbiteDone.emit('error'));
          });
        }
      }
    } else {
      message.channel.send(`> :x: The url is incorrect.`);
    }
  }
}
