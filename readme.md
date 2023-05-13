`tgnotify` A simple utility command to send message to Telegram via CLI. This can be handy if you have a long running task and want to know when it's done.

```shell
python3 train.py && tgnotify -m "Done!" \
  -i <chat_id> \
  -t <token>
```

### Help

```
Usage
  
  $ tgnotify

Options
  
  --message, -m Message to send.
  --token, -t Telegram bot token.
  --id, -i  Chat/Channel ID to send the message to.
  --verbose, -v Print debug messages

Examples
  
  $ tgnotify listen - to listen for ChatID by sending /id command to the bot.

```