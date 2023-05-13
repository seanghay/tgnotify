#!/usr/bin/env node
import 'dotenv/config.js';
import meow from 'meow';
import { Telegraf } from 'telegraf';

const TGNOTIFY_TOKEN = process.env.TGNOTIFY_TOKEN;
const TGNOTIFY_CHAT_ID = process.env.TGNOTIFY_CHAT_ID;
const TGNOTIFY_MESSAGE = process.env.TGNOTIFY_MESSAGE;
const TGNOTIFY_PARSE_MODE = process.env.TGNOTIFY_PARSE_MODE;

const DEFAULT_PARSE_MODES = ['Markdown', 'HTML', 'MarkdownV2'];

async function read(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
}

function dedupe(a = []) {
  return [...new Set(a)]
}

let inputMessage = TGNOTIFY_MESSAGE;

if (!process.stdin.isTTY) {
  inputMessage = await read(process.stdin);
  inputMessage = inputMessage.trim();
}

const cli = meow(`
Usage
  
  $ tgnotify

Options
  
  --message, -m Message to send.
  --token, -t Telegram bot token.
  --id, -i  Chat/Channel ID to send the message to.
  --verbose, -v Print debug messages

Examples
  
  $ tgnotify listen - to listen for ChatID by sending /id command to the bot.

`, {
  importMeta: import.meta,
  flags: {
    verbose: {
      shortFlag: "v",
      type: 'boolean',
      default: false,
    },
    parseMode: {
      shortFlag: 'p',
      type: 'string',
      choices: DEFAULT_PARSE_MODES,
    },
    token: {
      isRequired: (flags, input) => !Boolean(TGNOTIFY_TOKEN),
      type: 'string',
      shortFlag: 't',
    },
    message: {
      type: 'string',
      shortFlag: 'm',
      isRequired: (flags, input) => {
        if (input === 'listen') return false;
        return !Boolean(inputMessage)
      },
    },
    id: {
      type: 'string',
      shortFlag: 'i',
      isMultiple: true,
      isRequired: (flags, input) => {
        if (input === 'listen') return false;
        return !Boolean(TGNOTIFY_CHAT_ID)
      }
    },
  }
});

async function listenForChatId(timeoutMs = 20000) {
  return new Promise((resolve, reject) => {
    const bot = new Telegraf(TGNOTIFY_TOKEN);
    const timeoutId = setTimeout(() => {
      bot.stop("Timeout");
      reject("Timeout");
    }, timeoutMs);

    bot.command('id', async (ctx) => {
      const id = ctx.message.chat.id;
      clearTimeout(timeoutId);
      await ctx.reply(`Chat ID: \`${id}\``, { parse_mode: 'Markdown' });
      bot.stop();
      resolve(id);
    });

    bot.launch();
  })
}

if (cli.input && cli.input[0] === "listen") {
  console.log(`Listening for chat id! (Timeout in 20s)\nPlease send a /id command to your bot!`)
  try {
    const id = await listenForChatId();
    console.log(`The Chat ID: ${id}`);
    process.exit(0)
  } catch (e) {
    console.error('Timeout!')
    process.exit(1);
  }
}

const state = {
  text: cli.flags.message ?? inputMessage,
  chatIds: dedupe(cli.flags.id.length > 0 ? cli.flags.id : TGNOTIFY_CHAT_ID.split(",")),
  token: cli.flags.token ?? TGNOTIFY_TOKEN,
  parse_mode: DEFAULT_PARSE_MODES.includes(cli.flags.parseMode) ? cli.flags.parseMode : TGNOTIFY_PARSE_MODE
}

if (cli.flags.verbose) {
  Object.entries(state).forEach(([key, value]) => {
    console.log(`[tgnotify] ${key} -> ${JSON.stringify(value)}`)
  })
}

const bot = new Telegraf(state.token);
for (const chatId of state.chatIds) {
  try {
    await bot.telegram.sendMessage(chatId, state.text, { parse_mode: state.parse_mode });
    if (cli.flags.verbose) {
      console.log(`[tgnotify] sent a message to ${chatId}`);
    }
  } catch (e) {
    console.error(e);
  }
}