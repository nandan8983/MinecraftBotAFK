const express = require('express');
const app = express();
const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');
const POST = process.env.PORT || 3000;
dotenv.config();
const token = process.env.TELEGRAM_TOKEN || dotenv.config().parsed.TELEGRAM_TOKEN;

const { createClient } = require('bedrock-protocol');

const SERVER_IP = 'play.earthsmp.live';  
const SERVER_PORT = 19132;  
const BOT_NAME = '_HeroBrine86474';  



// const SERVER_IP =  process.env.SERVER || 'play.earthsmp.live';  
// const SERVER_PORT = process.env.PORT || 19132;  
// const BOT_NAME =  process.env.BOT_NAME ||'_HeroBrine86474';  
const RECONNECT_DELAY = 120000; // 5 seconds

app.listen(POST, () => {
    console.log(`Server is running at http://127.0.0.1:${POST}`);
});

app.get('/ping', (req, res) => {
    res.send('Pong!');
});




const Tbot = new TelegramBot(token, {filepath: false,polling: true});


var health = 0;
var food = 0;
var pcount = 0;
var isBotLogin = false;
var rec = 0;


async function startBot(msg) {
    if(isBotLogin){
        Tbot.sendMessage(msg.chat.id, `Bot is Already Login in the game!`);
        return;
    }else if(rec >= 2){
        Tbot.sendMessage(msg.chat.id, `Server is not responding! \n \ntry /login to login the bot in the game! After some time.`);
        rec = 0;
        return;
    }else{
    const bot = createClient({
        host: SERVER_IP,
        port: SERVER_PORT,
        username: BOT_NAME,
        offline: false,  
        authTitle: '00000000441cc96b', 
        flow: 'live',
        connectTimeout: 10000,
    });
 


    bot.on('packet', (packet) => {
        // logPacket(packet);
    
        // Intercept chunk_radius_update packet
        if (packet.data.name === 'chunk_radius_update') {
            // Force the render distance to 12 chunks
            console.log(`[🌍] render distance to ${packet.data.params.chunk_radius}`);
            // // Send the modified packet back to the bot
            // bot.write('chunk_radius_update', packet.data);
        }else if (packet.data.name === 'update_attributes' && packet.data.params.attributes) {
            // Handle update_attributes packet
            for (const attribute of packet.data.params.attributes) {
                if (attribute.name === 'minecraft:health') {
                    health = attribute.current;
                    // console.log(`[❤️] Health updated to ${health}`);
                } else if (attribute.name === 'minecraft:player.hunger') {
                    food = attribute.current;
                    // console.log(`[🍖] Food updated to ${food}`);
                }
            }
        }else if (packet.data.name === 'player_list' && packet.data.params.records.records_count > 1 && packet.data.params.records.type === 'add') {
            pcount = packet.data.params.records.records_count;
            if(pcount <= 4){
                BotDisconnect();
            }
        }
    });
    
    bot.on('join', () => {
        console.log(`[✅] ${BOT_NAME} joined the server.`);
        Tbot.sendMessage(msg.chat.id, `${BOT_NAME} Bot is Login in the game!`);
        
    });
    
    bot.on('spawn', () => {
        console.log(`[🌍] ${BOT_NAME} spawned in the server.`);
        Tbot.sendMessage(msg.chat.id, `${BOT_NAME} Bot is Live 🔴`);
        isBotLogin = true;
    });
    
    // bot.on('text', (packet) => {
    //     const message = stripColorCodes(packet.message);
    //     // console.log(`[❤️ ${health} / 20] [🍗 ${food} / 20] [ 🤦‍♂️ ${pcount + 1}] [💬 CHAT] ${message}`);
    // });
    
    bot.on('disconnect', (reason) => {
        console.log(`[❌] Bot disconnected: ${reason}`);
        reconnect(msg);
    });
    
    bot.on('error', (err) => {
        console.log(err);
        // Tbot.sendMessage(msg.chat.id, `Error`);
        reconnect(msg);
    });
    
    bot.on('end', () => {
        console.log(`[🔄] Bot connection ended. Reconnecting...`);
        reconnect(msg);
    });

    function BotDisconnect(){
        bot.disconnect();
        setTimeout(() => {
            bot.close();
        }, 2000);
          
    }
    bot.on('close', () => {
        console.log(`[❌] Bot closed`);
        Tbot.sendMessage(msg.chat.id, `Bot is Logout From the game!`);
    });
    
//is any button to clear all the message
   
    
    // function stripColorCodes(text) {
    //     return text.replace(/§[0-9A-FK-OR]/ig, ''); 
    // }
    Tbot.onText(/\/close/, (msg) => {
        if(!isBotLogin){
            Tbot.sendMessage(msg.chat.id, `Bot is not Login in the game!`);
            return;
        }
        isBotLogin = false;
        console.log(`Bot is Closeing the game!`);
        BotDisconnect();
    });
  

    }
}   

    Tbot.onText(/\/clear/, (msg) => {
        console.log(`Bot is Clear all the message!`);
        Tbot.deleteMessage( msg.chat.id, msg.message_id, a);
    });
    



function reconnect(msg) {
    if(rec < 3){
        rec++;
        console.log(`[⏳] Reconnecting in ${RECONNECT_DELAY / 1000} seconds...`);
        Tbot.sendMessage(msg.chat.id, `Reconnecting in ${RECONNECT_DELAY / 1000} seconds...`);
        setTimeout(() => {startBot(msg)}, RECONNECT_DELAY);
        
    }else{
        Tbot.sendMessage(msg.chat.id, `Server is not responding! \n \ntry /login to login the bot in the game! After some time.`);
        rec = 0;
        
    }
    return;
}
    // Log all packets to a JSON file
if(!isBotLogin){
    Tbot.onText(/\/close/, (msg) => {
        Tbot.sendMessage(msg.chat.id, `Bot is not Login in the game! \n \ntry /login to login the bot in the game!`);
    });
    
}
    


Tbot.onText(/\/health/, (msg) => {  
    if(!isBotLogin){
        Tbot.sendMessage(msg.chat.id, `Bot is not Login in the game! \n \ntry /login to login the bot in the game!`);
        return;
    }
    Tbot.sendMessage(msg.chat.id, `❤️ Health: ${health} \n🍗 Food: ${food} \n🤦‍♂️Players: ${pcount + 1}`);
    });




Tbot.onText(/\/login/, (msg) =>  {
    console.log(`Bot is Login in the game!`);
    try {
        if(isBotLogin){
            Tbot.sendMessage(msg.chat.id, `Bot is Already Login in the game!`);
            return;
        }else{
            startBot(msg);
        }
    } catch (error) {
        console.log(`Error: ${error}`);
        Tbot.sendMessage(msg.chat.id, `Something went wrong!!`);
    }
});



//add vertual keyborde to the bot
Tbot.onText(/\/about/, (msg) => {
    // bot.sendMessage(msg.chat.id, "This is a bot to help you to get the health of the bot in the game!");
});

