//const { promises } = require('json2csv/JSON2CSVTransform');
const request = require('request');
const block = require("./data/block.json");
// const axios = require('axios');
// const chalk = require('chalk');

//const URL = 'https://raw.githubusercontent.com/pranavsv16/Algorithms/master/bidder_dataset.csv';
//const TOKEN = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

//https://github.com/pranavsv16/Algorithms/blob/master/amazon.graph.small.csv
async function parseURL(url, id,userMsg){
    var urlComponents = url.split("blob");
    var filePath = urlComponents[1];
    var userRepo = urlComponents[0].split('/');
    var userName = userRepo[3];
    var repoName = userRepo[4];
    
    var URL = 'https://raw.githubusercontent.com/'+userName+'/'+repoName+filePath;
    var options = {
        url: URL
    };

    if(id==="getSummaryData"){
        let summaryData = await parseCSV(options, URL);
        return summaryData;
    }
    else if(id==="convertToJSON"){
        let jsonData = await parseCSVToJson(options);
        return jsonData;
    }

    else if ("truncateRows"===id){
        let modifiedFile = await truncateRows(options,userMsg);
        return modifiedFile;
    }
    else if(id==="dropColumn"){
        let fileData = await parseCSVToJson(options);
        return fileData;
    }
}

async function truncateRows(options,userMsg){
    return new Promise (function (resolve,reject){
        request(options,userMsg,function (err,response,body){
            
            if (err) reject(err);
            try{
                
                rowArray = body.split('\n');
                rowCount = rowArray.length-1;
                rowsArray = userMsg.split(',');
                var rowNumbers = []
                for (let i = 0;i <rowsArray.length;i++){

                    rowItem = rowsArray[i];
                    rowValues = rowItem.split('-');
                    if(rowValues.length === 1){
                        if (Number(rowValues[0])>rowCount){
                            resolve(["0","Entered rows more than row count in csv file"])
                        }
                        if (Number(rowValues[0])<1){
                            resolve(["0","Entered row less than 1"])
                        }
                        rowNumbers.push(Number(rowValues[0]));
                    }
                    else{
                        firstRowValue = Number(rowValues[0]);
                        secondRowValue = Number(rowValues[1]);
                        
                        if (firstRowValue>secondRowValue){
                            resolve(["0","Enter the range numbers correctly, in ascending order"])
                        }
                        if (firstRowValue<1){
                            resolve(["0","Entered row less than 1"])
                        }
                        if (secondRowValue>rowCount){
                            resolve(["0","Entered rows more than row count in csv file"])
                        }
                        for(let j =firstRowValue;j<= secondRowValue;j++){
                            rowNumbers.push(j);
                        }
                    }
                }
                rowArray = body.split('\n');
                console.log(rowArray);
                modifiedFile = []
                excludeSet = new Set(rowNumbers);
                
                for (let i=0;i<rowArray.length;i++){
                    if(!(excludeSet.has(i))){
                        modifiedFile.push(rowArray[i]);
                    }
                }
                
                modifiedFile = modifiedFile.join('\n');
                resolve(["1",modifiedFile]);
            }catch(err){
                reject(err);
        }
        })

    });
}
async function parseCSVToJson(options){
    return new Promise (function (resolve, reject) {
        request(options, function (err, response, body) {
            if (err) reject(err);
            var jsonData = [];
            rowArray = body.split('\n');
            columnNames = rowArray[0];
            columnNames = columnNames.split(",");
            for (let i = 1; i < rowArray.length; i++) {
                var obj = {};
                rowData = rowArray[i].split(",");
                for(let j=0; j<columnNames.length; j++){
                    obj[columnNames[j]] = rowData[j];
                }
                jsonData.push(obj);
            }
            jsonData.length = jsonData.length-1; 
            resolve(jsonData)
        })
    })   
}

async function parseCSV (options, url) {
    
    return new Promise (function (resolve, reject) {         
    request(options, function (err, response, body) {
        if (err) reject(err);
        var viewData = { 
            data : [] 
        };
        if(response.body == '404: Not Found'){
            var errorMessage = {
                type: 'plain_text',
                text: 'Sorry! URL does not exist'
            };
            var jsonpar = {
                type: 'section',
                text: errorMessage
            };
            viewData.data.push(jsonpar);
            resolve(viewData)
        }
        else{
            rowArray = body.split('\n');
            rowCount = rowArray.length-1;
            columnNames = rowArray[0];
            columnNames = columnNames.split(",");
            columnCount = columnNames.length;
            counter = 1;

            //Intro
            var intro = {
                type: 'plain_text',
                text: 'Here is the summary report : '
            };
            var jsonIntro = {
                type: 'section',
                text: intro
            };
            viewData.data.push(jsonIntro);
        
        
            //Number of rows
            var nrows = {
                type: 'plain_text',
                text: '1. Number of rows: '+rowCount
            };
            var jsonNRows = {
                type: 'section',
                text: nrows
            };
            viewData.data.push(jsonNRows);
            
            //Number of columns
            var ncolumns = {
                type: 'plain_text',
                text: '2. Number of columns: '+columnCount
            };
            var jsonNColumns = {
                type: 'section',
                text: ncolumns
            };
            viewData.data.push(jsonNColumns);

            var intro3rd = {
                type: 'plain_text',
                text: '3. Column Names (with Datatype)'
            };
            var jsonIntro3rd = {
                type: 'section',
                text: intro3rd
            };
            viewData.data.push(jsonIntro3rd);
            

            let colMap = new Map();
            colType = [];
        
            rowArrWHeader = rowArray.slice(1);
        
        
            for (const rowV of rowArrWHeader){
        
                row = rowV.split(",");
                colNumber = 0;
                row.forEach(ele =>{
                    if(ele.length && !colMap.has(columnNames[colNumber])){
                        resType = checkRegex(ele);
                        colMap.set(columnNames[colNumber], resType);
                    }
                    colNumber = colNumber+1;
        
                });
                if(colMap.length === columnCount){
                    break;
                }
            }
            
            colMap.delete(undefined)
            for (const [key, value] of colMap.entries()) {
                var datatype = value;
                var colName = key;
                var temp = {
                    type: 'plain_text',
                    text: colName+": "+datatype
                };
                var jsonData = {
                    type: 'section',
                    text: temp
                };
                viewData.data.push(jsonData);
            }
            resolve(viewData);
        }
    });
    })
}

function checkRegex(value){

    let regexInt = /^-?[0-9]+$/;
    let regexFloat = /^[-+]?[0-9]+\.[0-9]+$/;
    let resultInt = regexInt.test(value);
    if (resultInt){
        return "Integer";
    }
    let resultFloat = regexFloat.test(value);
    if(resultFloat){
        return "Float";
    }
    return "String";
}

async function checkURL(url){
    url = url.slice(0,-1);
    var urlComponents = url.split("blob");
    var filePath = urlComponents[1];
    var userRepo = urlComponents[0].split('/');
    var userName = userRepo[3];
    var repoName = userRepo[4];
    
    var URL = 'https://raw.githubusercontent.com/'+userName+'/'+repoName+filePath;
    var options = {
        url: URL
    };
    console.log(URL)
    return new Promise (function (resolve, reject) {         
        request(options, function (err, response, body) {
            if (err) reject(err);
            console.log(response.body);
            if(response.body == '404: Not Found'){
                resolve("404: Not Found")
            }
            else{
                resolve("OK")
            }
        })
    })    
}

// usecase 3a

//async function truncateRows()
//parseURL(URL, "getSummaryData")

exports.parseURL = parseURL;
exports.checkURL = checkURL;
exports.checkRegex = checkRegex;

