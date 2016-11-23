# snmp-bot
A simple SNMP Bot manager for Telegram. Just install and configure *snmpd* on the agent machine.

The following options are available:
- Load average
- CPU
- Memory
- Uptime

New features can be easily added.

## Installing

 - Install dependencies:
 
 `npm install net-snmp`

 - Configure BothFather Token in app.js:
 
 `var token = 'YOU_BOT_TOKEN';`

 - Run manager:
 
 `nodejs app.js`

 # Telegram Bot

 - Avaliable commands:
 
 --/start - Show this message
 
 --/session - Start a new SNMP session
 
 --/commands - Show the command list
 
![Avaliable commands](/img/img1.png)
![Options](/img/img2.png)
