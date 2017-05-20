var MongoClient = require('mongodb').MongoClient;

var moment = require("moment");

var secrets = require("./secrets.js");

var typogr = require('typogr');

var processStory = function (story) {

  story.displayDate = moment.unix(story.date).format('MMMM Do YYYY');

  story.text = story.text.split("\n").map(function (paragraph, number) {

    return "<p>" + paragraph + "</p>";

  }).join("");

  return story;

}

MongoClient.connect(secrets.mongourl, function (err, db) {

  var stories = db.collection('stories');

  var config = {
    port: 7788,
    static: __dirname + "/home",
    foursquareKey: secrets.foursquareKey,
    foursquareSecret: secrets.foursquareSecret,
    openWeatherKey: secrets.openWeatherKey
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

    stories.find({}).toArray(function (err, docs) {

      var storyList = {};

      docs.forEach(function (story, index) {

        storyList[story.title] = processStory(story);

      })

      res.send(library({
        header: header,
        footer: footer,
        stories: storyList
      }));

    })

  })

  rf.server.get("/library/:story", function (req, res) {

    stories.findOne({
      title: req.params.story
    }, function (err, doc) {

      if (doc) {

        res.send(story({
          header: header,
          footer: footer,
          story: processStory(doc)
        }));

      } else {

        res.status(404).send("Not found");

      }

    })

  })

});
