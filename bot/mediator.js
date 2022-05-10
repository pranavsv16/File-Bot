const slackApi = require("./slack.js")
let json2xlsx = require("json-as-xlsx")
const { parse } = require('json2csv');
const nock = require("nock");
const axios = require("axios");
const fs = require("fs");
const main = require("./main.js");
const block = require("./data/block.json")
const fileDrop = "./data/Drop.csv";
const fileTruncate = "./data/Truncate.csv";
const jsonfile = "./data/mock.json";
const xlsxfile = "./data/Book1.xlsx";

//main service in mediator.js
async function service(textmsg,client,channelId){
  try{
    const result = await client.chat.postMessage({
      channel: channelId,
      text: textmsg
    });
    return true;
  }
  catch(error){ console.log(error); return false}
}


  var githubservice = nock('https://github.com/pranavsv16/Algorithms/blob/master')
  .get('/youtube.graph.small.csv')
  .reply(200, (uri, requestBody) => {
    return fs.createReadStream(fileDrop);
  })

  var githubservice1 = nock('https://github.com/pranavsv16/Algorithms/blob/master')
  .get('/amazon.graph.small.csv')
  .reply(200, (uri, requestBody) => {
    return fs.createReadStream(fileDrop);
  })

  var githubservice2 = nock('https://github.com/pranavsv16/Algorithms/blob/master')
  .get('/dblp.graph.small.csv')
  .reply(200, (uri, requestBody) => {
    return fs.createReadStream(fileDrop);
  })

  var githubservice3 = nock('https://github.com/pranavsv16/Algorithms/blob/master')
  .get('/bidder_dataset.csv')
  .reply(200, (uri, requestBody) => {
    return fs.createReadStream(fileDrop);
  })

  var githubservice4 = nock('https://github.com/pranavsv16/Algorithms/blob/master')
  .get('/abc.csv')
  .reply(200, (uri, requestBody) => {
    return fs.createReadStream(fileDrop);
  })

//to get Summary Data
  const getSummaryData = async (url) => {
    const res = await getCSVFile(url, "getSummaryData", null);
    //const data = res.data;
    return res.data;
  }

//to get CSV file
  const getCSVFile = async (url, id,userMsg) => {
    console.log(url);
        
    const res =  await main.parseURL(url, id,userMsg); //await axios.get(url)
    return res;
  }

  async function convertToJSON(url){
    const res = await getCSVFile(url, "convertToJSON",null);
    var data = JSON.stringify(res);
    fs.writeFile("file.json", data, (err) => {
      if (err)
        console.log(err);
    })
    //console.log(res)

    return fs.createReadStream("./file.json");
  }

  async function convertToXLSX(url){
    const res = await getCSVFile(url, "convertToJSON",null);
    //console.log(res);
    var colNames = Object.keys(res[0]);
    var columns = []
    colNames.forEach(function myFunction(item, index){
        var col = {label: item, value: item};
        columns.push(col);
      }
    );
  // viewData.data.push(jsonIntro);
    let data = [
      {
        sheet: "data",
        columns: columns,
        content: res,
      }
    ]
    var settings = {
      fileName: "data"
    }
    json2xlsx(data,settings);
    return fs.createReadStream('./data.xlsx');
  }

  const dropColumn = async (url, colNumber) => {
    var csv;
    var col = colNumber.slice(6);  
    var prop;
    const jsonData = await getCSVFile(url, "dropColumn");
    var count = 1;
    for (let x in jsonData[0]) {
      if(col == count){
        prop = x;
        break;
      }
      count++;
    }
    if(col<1 || col>count){
      return 'invalid column entered'
    }
    for (let i = 0; i < jsonData.length; i++) {
      delete jsonData[i][prop]
    }

    const fields = Object.keys(jsonData[0]);
    const opts = { fields };
    console.log(fields)
    try {
      csv = parse(jsonData, opts);
      //console.log(csv);
    } catch (err) {
      console.error(err);
    }
    fs.writeFileSync('file.csv', csv);
    return fs.createReadStream('./file.csv');
  }
 
  
  const truncateRows = async (url,userMsg) => {
   
    const res = await getCSVFile(url, "truncateRows",userMsg);
    // logic
    //fs.createReadStream(res);
    return res;
  }

  async function serviceDrop(textmsg,client,channelId){
    try{
      const result = await client.chat.postMessage({
        channel: channelId,
        text: textmsg
      });
      return true;
    }
    catch(error){console.log(error)}
  }

  async function serviceTruncate(textmsg,client,channelId){
    try{
      const result = await client.chat.postMessage({
        channel: channelId,
        text: textmsg
      });
      return true;
    }
    catch(error){console.log(error)}
  }

// var mockService3drop = nock('http://api.github.com')
//  .get('/repos/ynghatol/CSC-510-15/contents/dropped.csv')
//  .reply(200, JSON.stringify(fileDrop))

exports.service = service;
exports.getCSVFile = getCSVFile;
exports.convertToJSON = convertToJSON;
exports.convertToXLSX = convertToXLSX;
exports.serviceDrop = serviceDrop;
exports.serviceTruncate = serviceTruncate;
exports.getSummaryData = getSummaryData;
exports.dropColumn = dropColumn;
exports.truncateRows = truncateRows;