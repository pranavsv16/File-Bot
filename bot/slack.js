const { App } = require("@slack/bolt");
const msg = require("./attachments/message1.json");
const msg2 = require("./attachments/message2.json");
const msg3 = require("./attachments/message3.json");
const mediator = require("./mediator.js")
const main = require('./main.js');
const fs = require("fs");
const { convertArrayToCSV } = require('convert-array-to-csv');
const CSV = require('csv-string');
//to get the tokens from env file
require("dotenv").config();

// Require the Node Slack SDK package (github.com/slackapi/node-slack-sdk)
const { WebClient, LogLevel } = require("@slack/web-api");

// WebClient instantiates a client that can call API methods
// When using Bolt, you can use either `app.client` or the `client` passed to listeners.
const client = new WebClient(process.env.SLACK_BOT_TOKEN, {
//LogLevel can be imported and used to make debugging simpler
logLevel: LogLevel.ERROR});


// session-global variables
let boolService1 = false;
let boolService2 = false;
let boolService3 = false;
let channelId = "";
let userID = process.env.USER_TOKEN;
let fileName = '';

// Initializes the bot with the bot token and signing secret
const slackBot = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true, // enable the following to use socket mode
  appToken: process.env.APP_TOKEN});


// start the File Bot
slackBot.command("/filebot", async ({ command, ack }) => {
  try {
    await ack();
    if (command.user_id == userID){
      channelId = command.channel_id;
      const result = await client.chat.postMessage({
        channel: channelId,
        text: msg.text,
        attachments: msg.attachments});}}
  catch (error) {console.error(error);}
});

// Responding to a particular message on slack, here check if it has "http"
slackBot.message(/(.*?)/, async ({ message}) => {
  try{
    
   if(message.user==userID){
    parseMessage(message.text)}
   }
   catch(error){
    console.log(error)}
});

//This function parses the messages and checks if it is http/column or rows
async function parseMessage(userMsg){
  // we use 3 regex expressions to evaluate this
  console.log("User entered: "+userMsg)
  let regexFileExp = /https:\/\/github.com\/[^]+.csv/;
  let regexColumnExp = /column[^]/;
  let rowsExp = /^(\d+-?)+\d+$/;
  try{
    // if userMsg is null, return false
      if (userMsg === null){
        return false
      }
      // if userMsg matches github url
      if(regexFileExp.test(userMsg)){
        console.log("http file entered")
        fileName = userMsg.substring(1,userMsg.length-1)//https://github.com/pranavsv16/Algorithms/blob/master/youtube.graph.small.csv
        return parseFileMessage(userMsg);
      }
      // if userMsg matches column regex
      else if(regexColumnExp.test(userMsg)){
        console.log("column entered")
        return parseColumnMessage(userMsg);
      }
      // if userMsg matches row numbers regex
      else if(rowsExp.test(userMsg)){
        console.log("row numbers entered")
        return parseRowsMessage(userMsg);
      }
      else{
        return false
      }
  }
  catch(error){
    console.log(error)
  }
}

async function parseFileMessage(userMsg){
  try{
    
      if (boolService1){
        // call the first service from main.js
        const block = await mediator.getSummaryData(fileName,null);
        const result = await client.chat.postMessage({
            channel: channelId,
            blocks: block
          });
        boolService1 = false; 
      }
      // call the second service from main.js
      else if (boolService2){
          
          let status = await main.checkURL(userMsg);
          console.log("STATUS: ", status);
          if(status=='404: Not Found'){
            const result = await client.chat.postMessage({
              channel: channelId,
              text: "Sorry! URL does not exist"
            });
          }
          else{
            const result = await client.chat.postMessage({
              channel: channelId,
              attachments: msg2.attachments
            });
            boolService2 = false;
          } 
      }
      // call the third service from main.js
      else if (boolService3){
          const result = await client.chat.postMessage({
            channel: channelId,
            attachments: msg3.attachments
          });  
        //boolService3 = false; 
      }
      return true;
    }
  catch(error){console.log(error)}
}

async function parseColumnMessage(userMsg){
  try{
    // Parse message for service column drop
    console.log(boolService3);
    if (boolService3){
        const fileDrop = await mediator.dropColumn(fileName, userMsg);
        // Call the files.upload method using the WebClient
        console.log(typeof fileDrop);
        if((typeof fileDrop)=='string'){
          const result = await client.chat.postMessage({
            channel: channelId,
            text: "Please enter valid column number"
          });
        }
        else{
          const result = await client.files.upload({
            channels: channelId,
            initial_comment: "Here\'s your updated file :smile:",
            file: fileDrop
          });
        }
      }
      return true;
    }
      catch (error) {console.error(error);}
}

async function parseRowsMessage(userMsg){
  try{
    // Parse message for service truncate rows
    if (boolService3){
      const res = await mediator.truncateRows(fileName,userMsg);
      
      if (res[0] === '0'){
        const result = await client.chat.postMessage({
          channel: channelId,
          //initial_comment: "Here\'s your updated file :smile:",
          text: res[1]
        });
      }
      else{
          fs.writeFile("data/TruncateFile.csv", res[1], (err) => {
            if (err)
              console.log(err);
          })
      
          fileTruncated= fs.createReadStream("./data/TruncateFile.csv");
          
          console.log(fileTruncated);
          const result = await client.files.upload({
            channels: channelId,
            initial_comment: "Here\'s your updated file :smile:",
            file: fileTruncated
        });
      }
    }
    return true;
  }
  catch (error) {console.error(error);}
    
}

// Responding to menu driven actions for 1 st service
slackBot.action({ callback_id:msg.attachments[0].callback_id}, async ({body, payload}) => {
  try{
    if(body.user.id==userID){
      mainMenuDriven(client,channelId,payload.value);
    }
  }catch(error){console.error(error);}
});

// This function gets called for MenuDrivenOptions
// Menu selection should have either service1/service2/service3.
async function mainMenuDriven(client,channelId,menuSelection){
  try{
    console.log("User selected menu option: "+menuSelection)
    textmsg = "Please provide the github url of the file";
    let boolService = await mediator.service(textmsg,client,channelId);
    let serviceFlag = false;
    //First service of summary report
    if(menuSelection=="service1"){
      boolService1 = boolService;
      serviceFlag = true;
    }
    //Second service to change format
    else if(menuSelection=="service2"){
      boolService2 = boolService;
      serviceFlag = true;
    }
    //Third service to file manipulation
    else if(menuSelection=="service3"){
      
      boolService3 = boolService;
      serviceFlag = true;
    }
    
    return serviceFlag;
  }
   catch(error){console.log(error);}
}

// Responding to menu driven actions for 2 nd service
slackBot.action({ callback_id:msg2.attachments[0].callback_id}, async ({body, payload}) => {
  try{
    if(body.user.id==userID){
      fileConversionAction(payload.value,fileName);
    }
  }catch(error){console.error(error);}
});

//This function gets called for file conversions
async function fileConversionAction(fileFormat,fileName){
  try{
    console.log("user selected file format : "+fileFormat);
    textmsg = "Please provide the github url of the file";

    if (fileFormat=="json"){
      jsonfile = await mediator.convertToJSON(fileName);
        // Call the files.upload method using the WebClient
        const result = await client.files.upload({
          channels: channelId,
          initial_comment: "Here\'s your updated file in JSON format :smile:",
          file: jsonfile
        });
    }
    else if (fileFormat=="xlsx"){
      xlsxfile = await mediator.convertToXLSX(fileName);
        // Call the files.upload method using the WebClient
        const result = await client.files.upload({
          channels: channelId,
          initial_comment: "Here\'s your updated file in XLSX format :smile:",
          file: xlsxfile
        });
    }
    return true;
  }
  catch(error){
    console.log(error);return false;
  }
}
// Responding to menu driven actions for 3 rd service
slackBot.action({ callback_id:msg3.attachments[0].callback_id}, async ({body, payload}) => {
  try{
    if(body.user.id==userID){
      fileManipulationAction(payload.value,client,channelId);
    }
  }catch(error){console.error(error);}
});

// This function is used for file manipulations
async function fileManipulationAction(manipulateOption,client,channelId){
  try{
    
      let flagOption = false;
      console.log("user selected manipulateOption : "+manipulateOption);
      //file manipulation for droping a column
      if(manipulateOption=="serviceDrop"){
        textmsg = "Enter the column name";
        let boolServiceDrop = await mediator.serviceDrop(textmsg,client,channelId); 
        flagOption = true;  
      }
      //file manipulation for truncating rows
      else if (manipulateOption=="serviceTruncate"){
        textmsg = "Enter row numbers (from-to) to truncate";
        let boolServiceTruncate = await mediator.serviceTruncate(textmsg,client,channelId);
        flagOption = true;
      }  
      return flagOption;  
}catch(error){console.log(error);return false;}
}

//Start the server
(async () => {
  const port = 3000
  await slackBot.start(process.env.PORT || port);
  console.log(`⚡️ File Bot is running on port ${port}!`);
})();

exports.parseMessage = parseMessage;
exports.fileConversionAction = fileConversionAction;
exports.fileManipulationAction = fileManipulationAction;
exports.mainMenuDriven = mainMenuDriven;