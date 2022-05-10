var chai   = require('chai');
const main = require('../main.js');
var assert = chai.assert,
    expect = chai.expect;
console.log = function(){};
//process.env.NODE_ENV = 'test'
//var bot = require('../index');
require("dotenv").config();

// Require the Node Slack SDK package (github.com/slackapi/node-slack-sdk)
const { WebClient, LogLevel } = require("@slack/web-api");

// WebClient instantiates a client that can call API methods
// When using Bolt, you can use either `app.client` or the `client` passed to listeners.
const client = new WebClient({})
// process.env.SLACK_BOT_TOKEN, {
//   //LogLevel can be imported and used to make debugging simpler
//   logLevel: LogLevel.ERROR
// });
var mediator = require('../mediator.js');
var slack = require('../slack.js')


describe("File Summary report features tests", function(){
    it("ensures that mediator.getSummaryData() returns true on successful returning summary data", async function() {
        // CREATE TEST OBJECT
        
        let returnValue = await mediator.getSummaryData('https://github.com/pranavsv16/Algorithms/blob/master/youtube.graph.small.csv');
        console.log("CHECK HERE: "+ returnValue)
        //console.log(returnValue);
        var flag = false;
        if(returnValue!=null){
            flag = true;
        }
        assert(flag === true);
    });
});


describe("File conversion feature tests", function() {
    this.timeout(5000);
    it("ensures that convertToJSON() returns json file", async function() {
        let returnFile = await mediator.convertToJSON('https://github.com/pranavsv16/Algorithms/blob/master/youtube.graph.small.csv');
        let filepath = returnFile.path
        expect(filepath.substring(filepath.length - 4)).to.equal('json');
    });
    it("ensures that convertToJSON() does not return null object", async function() {
        let returnValue = await mediator.convertToJSON('https://github.com/pranavsv16/Algorithms/blob/master/youtube.graph.small.csv');
        var flag = false;
        if(returnValue){
            flag = true;
        }
        assert(flag === true);
    });
    it("ensures that convertToXLSX() returns xlsx file", async function() {
        let returnFile = await mediator.convertToXLSX('https://github.com/pranavsv16/Algorithms/blob/master/youtube.graph.small.csv');
        let filepath = returnFile.path
        expect(filepath.substring(filepath.length - 4)).to.equal('xlsx');
    });
    it("ensures that convertToXLSX() does not return null object", async function() {
        let returnValue = await mediator.convertToXLSX('https://github.com/pranavsv16/Algorithms/blob/master/youtube.graph.small.csv');
        var flag = false;
        if(returnValue){
            flag = true;
        }
        assert(flag === true);
    });
    it("ensures that fileConversionAction() returns false for mocked clients", async function() {
        // CREATE TEST OBJECT
        let returnValue = await slack.fileConversionAction("xlsx",'https://github.com/pranavsv16/Algorithms/blob/master/youtube.graph.small.csv');
        assert(returnValue===false);
    });

    it("ensures that fileConversionAction() returns false for mocked clients", async function() {
        // CREATE TEST OBJECT
        let returnValue = await slack.fileConversionAction("json",'https://github.com/pranavsv16/Algorithms/blob/master/youtube.graph.small.csv');
        assert(returnValue===false);
    });
});


describe("File manipulation feature tests", function() {
    it("ensures that fileManipulationAction() returns true on selecting drop column button", async function() {
        let returnValue = await slack.fileManipulationAction("serviceDrop",client,"D035URF4TT4");
        assert(returnValue===true);
    });

    it("ensures that fileManipulationAction() returns true on selecting truncate rows button", async function() {
        let returnValue = await slack.fileManipulationAction("serviceTruncate",client,"D035URF4TT4");
        assert(returnValue===true);
    });
});



describe("File Object Tests", function() {
    this.timeout(5000);
    it("ensures that mediator.dropColumn() returns true on successful returning object", async function() {
        // CREATE TEST OBJECT
        let returnValue = await mediator.dropColumn('https://github.com/pranavsv16/Algorithms/blob/master/youtube.graph.small.csv', "column2");
        var flag = false;
        if(typeof returnValue === 'object'){
            flag = true;
        }
        assert(flag === true);
    });

    it("ensures that mediator.truncateRows() returns true on successful returning object", async function() {
        // CREATE TEST OBJECT
        let returnValue = await mediator.truncateRows('https://github.com/pranavsv16/Algorithms/blob/master/youtube.graph.small.csv', "5-6");
        //console.log(typeof returnValue);
        var flag = false;
        if(typeof returnValue === 'object'){
            flag = true;
        }
        assert(flag === true);
    });

    it("ensures that mediator.convertToJSON() returns true on successful returned object", async function() {
        // CREATE TEST OBJECT
        let returnValue = await mediator.convertToJSON('https://github.com/pranavsv16/Algorithms/blob/master/youtube.graph.small.csv');
        var flag = false;
        if(typeof returnValue === 'object'){
            flag = true;
        }
        assert(flag === true);
    });

    it("ensures that mediator.convertToXLSX() returns true on successful returned object", async function() {
        // CREATE TEST OBJECT
        let returnValue = await mediator.convertToXLSX('https://github.com/pranavsv16/Algorithms/blob/master/youtube.graph.small.csv');
        //console.log(typeof returnValue);
        var flag = false;
        if(typeof returnValue === 'object'){
            flag = true;
        }
        assert(flag === true);
    });
});


describe("File Bot interaction Tests", function(){
    it("ensures that mediator.Service() returns false on mocked clients", async function() {
        let returnValue = await mediator.service("Hello", client, "D035URF4TT4");
        assert(returnValue === false);
    });

    it("ensures that parseMessage() returns true on valid URL entered", async function() {
        let returnValue = await slack.parseMessage("https://github.com/repos/ynghatol/contents/abc.csv");
        console.log(returnValue)
        assert(returnValue===true);
    });

    it("ensures that parseMessage() returns false on invalid URL entered", async function() {
        let returnValue = await slack.parseMessage("https://github.com/repos/ynghatol/contents/ab");
        assert(returnValue===false);
    });

    it("ensures that parseMessage() returns true on valid column entered", async function() {
        let returnValue = await slack.parseMessage("column1");
        assert(returnValue===true);
    });

    it("ensures that parseMessage() returns false on invalid column entered", async function() {
        let returnValue = await slack.parseMessage("col1");
        assert(returnValue===false);
    });

    it("ensures that parseMessage() returns true on valid rows entered", async function() {
        let returnValue = await slack.parseMessage("12-23");
        assert(returnValue===true);
    });

    it("ensures that parseMessage() returns false on invalid rows entered", async function() {
        let returnValue = await slack.parseMessage("1,2,3");
        assert(returnValue===false);
    });

    it("ensures that mainMenuDriven() returns true on selecting service1", async function() {
        let returnValue = await slack.mainMenuDriven(client,"D035URF4TT4","service1");
        assert(returnValue===true);
    });

    it("ensures that mainMenuDriven() returns true on selecting service2", async function() {
        let returnValue = await slack.mainMenuDriven(client,"D035URF4TT4","service2");
        assert(returnValue===true);
    });

    it("ensures that mainMenuDriven() returns true on selecting service3", async function() {
        let returnValue = await slack.mainMenuDriven(client,"D035URF4TT4","service3");
        assert(returnValue===true);
    });
});


describe("Null Checks", function() {
    it("ensures that parseMessage() returns false on empty input", async function() {
        let returnValue = await slack.parseMessage(null);
        assert(returnValue===false);
    });

    it("ensures that parseMessage() returns false on invalid input", async function() {
        let returnValue = await slack.parseMessage("invalid message");
        assert(returnValue===false);
    });

    it("ensures that mainMenuDriven() returns false on No service selected", async function() {
        let returnValue = await slack.mainMenuDriven(client,"D035URF4TT4","noservice");
        assert(returnValue===false);
    });

    it("ensures that fileManipulationAction() returns false on No service selected", async function() {
        let returnValue = await slack.fileManipulationAction("noservice",client,"D035URF4TT4");
        assert(returnValue===false);
    });
});


describe("test cases for main.js", function() {
    it("ensures that checkURL() returns True if appropriate URL exist", async function() {
        let returnValue = await main.checkURL("https://github.com/pranavsv16/Algorithms/blob/master/youtube.graph.small.csv}");
        assert(returnValue==="OK");
    });

    it("ensures that checkURL() returns True if appropriate URL exist", async function() {
        let returnValue = await main.checkURL("https://github.com/pranavsv16/Algorithms/blob/master/youtube.graph.smalv}");
        assert(returnValue==="404: Not Found");
    });


    it("ensures that checkRegex() returns True for Integer value", async function() {
        let returnValue = await main.checkRegex("12");
        assert(returnValue==="Integer");
    });
    it("ensures that checkRegex() returns True for Float value", async function() {
        let returnValue = await main.checkRegex("12.24");
        assert(returnValue==="Float");
    });
    it("ensures that checkRegex() returns True for String value", async function() {
        let returnValue = await main.checkRegex("FileBot");
        assert(returnValue==="String");
    });
});