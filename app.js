var snmp = require ("net-snmp");
var TelegramBot = require('node-telegram-bot-api');

// Define BothFather Token
var token = 'YOU_BOT_TOKEN';

// Create a TelegramBot instance
var bot = new TelegramBot(token, { polling: true });

/**
* Command /start
* Show the list of commands available to the bot
**/
bot.onText(/\/start/, function (msg, match) {
    var chatId = msg.chat.id;

    var resp = "Avaliable commands:\n";
    resp += "/start - Show this message\n";
    resp += "/session - Start a new SNMP session\n";
    resp += '/commands - Show the command list\n';

    // send back the matched "whatever" to the chat
    bot.sendMessage(chatId, resp);
});

// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', function (msg) {

    switch (getCommand()) {
        case 'session':
            commandSession(chatId, msg.text);
            setCommand();
        break;
            default:
            break;
    }

    // send a message to the chat acknowledging receipt of their message
    //bot.sendMessage(chatId, "Received your message");
});


/**
* Snmp Session Setter
**/
var setSession = function(session)
{
    this.session = session;
};

/**
* Snmp Session Getter
**/
var getSession = function() {
    return this.session;
};

/**
* Set current command
**/
var setCommand = function(command) {
    this.command = command;
};

/**
* Get current command
**/
var getCommand = function() {
    return this.command;
}

/**
* Set current ChatId
**/
function setChatId(chatId) {
    this.chatId = chatId;
}

/**
* Get current ChatId
**/
function getChatId()
{
    return this.chatId;
}

/**
* Load Buttons
**/
function loadButtons() {
    var options = {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{ text: 'Load average', callback_data: 'loadaverage' }],
                [{ text: 'CPU', callback_data: 'cpu' }],
                [{ text: 'Memory', callback_data: 'memory' }],
                [{ text: 'Uptime', callback_data: 'uptime' }]
            ]
        })
    };
    bot.sendMessage(getChatId(), 'Seleect an option to show:', options).then(function (sended) {
        // `sended` is the sent message.
    });
}

/**
* Show a default buttons options
**/
bot.onText(/\/commands/, function (msg, match) {
    loadButtons();
});

/**
* Receive a button callback
**/
bot.on('callback_query', function (msg) {
    setChatId(msg.message.chat.id);
    setCommand(msg.data);
    bot.sendMessage(getChatId(), 'Processing, wait...').then(function (sended) {
        switch (msg.data) {
            case 'loadaverage':
                loadaverage();
                setCommand();
                break;
            case 'cpu':
                cpu();
                setCommand();
                break;
            case 'memory':
                memory();
                setCommand();
                break;
            case 'uptime':
                uptime();
                setCommand();
                break;
            default:
            break;
        }
    });
});

/**
* Get the load average
**/
function loadaverage() {
    console.log('processing load average');
    var msg = "Load average:\n\n";
    var min = [1,5,15];
    var i = 0;
    getOid(['1.3.6.1.4.1.2021.10.1.3.1', '1.3.6.1.4.1.2021.10.1.3.2', '1.3.6.1.4.1.2021.10.1.3.3'], function(data) {
        msg += min[i]+" minute(s): "+data+"\n";
        if( i == 2)
        {
            bot.sendMessage(getChatId(),msg);
        }
        i = i+1;
    });
}

/**
* Get CPU info
**/
function cpu() {
    console.log('processing cpu');
    var msg = "CPU:\n\n";
    var i = 0;
    var desc = ['percentage of user: ',
                'raw user cpu time: ',
                'percentages of system CPU time: ',
                'raw system cpu time: ',
                'percentages of idle CPU time: ',
                'raw idle cpu time: ',
                'raw nice cpu time: '];

    getOid(['1.3.6.1.4.1.2021.11.9.0', '1.3.6.1.4.1.2021.11.50.0', '1.3.6.1.4.1.2021.11.10.0', '1.3.6.1.4.1.2021.11.52.0',
    '1.3.6.1.4.1.2021.11.11.0', '1.3.6.1.4.1.2021.11.53.0', '1.3.6.1.4.1.2021.11.51.0'], function(data) {
        msg += desc[i]+data+"\n";
        if( i == desc.length -1 )
        {
            bot.sendMessage(getChatId(), msg);
        }
        i = i+1;
    });
}

/**
* Get memory info
**/
function memory() {
    console.log('processing memory');
    var msg = "Memory:\n\n";
    var i = 0;
    var desc = ['Total Swap Size: ',
                'Available Swap Space: ',
                'Total RAM in machine: ',
                'Total RAM used: ',
                'Total RAM Free: ',
                'Total RAM Shared: ',
                'Total RAM Buffered: ',
                'Total Cached Memory: '];

    getOid(['1.3.6.1.4.1.2021.4.3.0', '1.3.6.1.4.1.2021.4.4.0', '1.3.6.1.4.1.2021.4.5.0',
    '1.3.6.1.4.1.2021.4.6.0', '1.3.6.1.4.1.2021.4.11.0', '1.3.6.1.4.1.2021.4.13.0',
    '1.3.6.1.4.1.2021.4.14.0', '1.3.6.1.4.1.2021.4.15.0'], function(data) {
        msg += desc[i]+(data/1000)+" MB\n";
        if( i == desc.length -1 )
        {
            bot.sendMessage(getChatId(), msg);
        }
        i = i+1;
    });
}

/**
* Get uptime info
**/
function uptime() {
    console.log('function uptime');
    var msg = "UPTIME:\n\n";
    getOid(['1.3.6.1.2.1.1.3.0'], function(data) {

        var seconds = Math.round(data/100);
        var minutes = Math.round(seconds/60);
        var hours = Math.round(minutes/60);
        var time = hours+':'+(minutes/10)+':'+(seconds/1000);

        msg += 'Uptime: '+time+"\n";
        bot.sendMessage(getChatId(), msg);
    });
}

/**
* Execute an SNMP get
**/
function getOid(oid, callback) {
    if( !getSession() )
    {
        // send back the matched "whatever" to the chat
        bot.sendMessage(chatId, "You have not established a connection. Use /session <address> before.");
    }
    else
    {
        getSession().get (oid, function (error, varbinds) {
            if (error) {
                console.error (error);
            } else {
                for (var i = 0; i < varbinds.length; i++)
                if (snmp.isVarbindError (varbinds[i])) {
                    console.error (snmp.varbindError (varbinds[i]));
                    bot.sendMessage(chatId, "An error occurred:\n "+snmp.varbindError (varbinds[i]));
                } else {
                    callback(varbinds[i].value);
                }
            }
        });
    }
}

/**
* Open a new SNMP session
**/
bot.onText(/\/session/, function (msg, match) {
    setCommand('session');
    setChatId(msg.chat.id);
    bot.sendMessage(msg.from.id, 'Enter the SNMP agent address');
});

/**
* User enter Session
**/
var commandSession = function(chatId, ip) {
    setSession(snmp.createSession(ip, "public"));
    bot.sendMessage(chatId, "Sure! A new SNMP connection open in "+ip);
    console.log('Sure! A new SNMP connection open in %s', ip);
}
