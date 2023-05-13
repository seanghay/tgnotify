`tgnotify` A simple utility command to send message to Telegram via CLI. This can be handy if you have a long running task and want to know when it's done.

```shell
python3 train.py && tgnotify -m "Done!" \
  -i <chat_id> \
  -t <token>
```


## Installation

```
npm install -g tgnotify@latest
```

### Help

```
Usage
  
  $ tgnotify

Options
  
  --message, -m Message to send.
  --token, -t Telegram bot token.
  --id, -i  Chat/Channel ID to send the message to.
  --parse-mode, -p  Message parse mode. (HTML, Markdown, MarkdownV2)
  --verbose, -v Print debug messages

Examples
  
  $ tgnotify listen - to listen for ChatID by sending /id command to the bot.

```

## Environment

You can also use `.env` with the content below.

```shell
TGNOTIFY_TOKEN=
TGNOTIFY_CHAT_ID=
TGNOTIFY_MESSAGE="Hello, *World*"
TGNOTIFY_PARSE_MODE="Markdown"
```
