var config = {
  port: 7788,
  foursquareKey: "GLVSRGETGQAOFL01NNFNPPIG3RUFRIBCKWPXJSMSYUVD15V2",
  foursquareSecret: "LXUN1X2B4DRF2EKMURYEZRPYBLML2MND5ZKOKWILD5KSZ2EE",
  openWeatherKey: "4e36efb3cd43a9037a66de5e5d054493",
  static: __dirname + "/home",
};

var Handlebars = require("handlebars");

Handlebars.registerHelper('raw-helper', function (options) {
  return options.fn();
});

var rf = require("relativefiction")(config);

var fs = require("fs");

// Prepare template files

var header = Handlebars.compile(fs.readFileSync(__dirname + "/templates/header.html", "utf8"))();
var home = Handlebars.compile(fs.readFileSync(__dirname + "/templates/home.html", "utf8"));
var library = Handlebars.compile(fs.readFileSync(__dirname + "/templates/library.html", "utf8"));
var story = Handlebars.compile(fs.readFileSync(__dirname + "/templates/story.html", "utf8"));
var editor = Handlebars.compile(fs.readFileSync(__dirname + "/templates/editor.html", "utf8"));
var footer = Handlebars.compile(fs.readFileSync(__dirname + "/templates/footer.html", "utf8"));

rf.server.get("/", function (req, res) {

  res.send(home({
    header: header,
    footer: footer
  }));

})

rf.server.get("/library", function (req, res) {

  res.send(library({
    header: header,
    footer: footer,
    stories: rf.stories
  }));

})

rf.server.get("/library/:story", function (req, res) {

  if (rf.stories[req.params.story]) {

    res.send(story({
      header: header,
      footer: footer,
      story: rf.stories[req.params.story]
    }));

  } else {

    res.status(404).send("Not found");

  }

})

var MongoClient = require('mongodb').MongoClient;

var moment = require("moment");

rf.stories = {};

// Connection URL 
var url = require("./secrets.js");

// Use connect method to connect to the Server 
MongoClient.connect(url, function (err, db) {

  var collection = db.collection('stories');

  collection.find({}).toArray(function (err, docs) {

    docs.forEach(function (story) {

      story.displayDate = moment.unix(story.date).format('MMMM Do YYYY');

      story.text = story.text.split("\n").map(function (paragraph, number) {

        return "<p>" + paragraph + "</p>";

      }).join("");

      rf.stories[story.title] = story;

    })

  })

  db.close();
});
