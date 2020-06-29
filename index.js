var moment = require("moment");

var secrets = require("./secrets.js");

var processStory = function (story) {

  story.displayDate = moment.unix(story.date).format('MMMM Do YYYY');

  story.text = story.text.split("\n").map(function (paragraph, number) {

    return "<p>" + paragraph + "</p>";

  }).join("");

  return story;

};

var fs = require("fs");

// Prepare template files

var Handlebars = require("handlebars");

var header = Handlebars.compile(fs.readFileSync(__dirname + "/templates/header.html", "utf8"))();
var home = Handlebars.compile(fs.readFileSync(__dirname + "/templates/home.html", "utf8"));
var library = Handlebars.compile(fs.readFileSync(__dirname + "/templates/library.html", "utf8"));
var story = Handlebars.compile(fs.readFileSync(__dirname + "/templates/story.html", "utf8"));
var editor = Handlebars.compile(fs.readFileSync(__dirname + "/templates/editor.html", "utf8"));
var footer = Handlebars.compile(fs.readFileSync(__dirname + "/templates/footer.html", "utf8"));



const Datastore = require('nedb');

const stories = new Datastore({ filename: 'stories.db', autoload: true });

var config = {
  port: 7788,
  static: __dirname + "/home",
  foursquareKey: secrets.foursquareKey,
  foursquareSecret: secrets.foursquareSecret,
  openWeatherKey: secrets.openWeatherKey
};

Handlebars.registerHelper('raw-helper', function (options) {
  return options.fn();
});

var rf = require("relativefiction")(config);

rf.server.get("/", function (req, res) {

  res.send(home({
    header: header,
    footer: footer
  }));

});

rf.server.get("/library", function (req, res) {

  stories.find({}).sort({ "date": -1 }).exec(function (err, docs) {

    var storyList = {};

    docs.forEach(function (story, index) {

      storyList[story.title] = processStory(story);

    });

    res.send(library({
      header: header,
      footer: footer,
      stories: storyList
    }));

  });

});

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

  });

});

rf.server.get("/editor", function (req, res) {

  res.send(editor({
    header: header,
    footer: footer
  }));

});

rf.server.get("/editor/:key", function (req, res) {

  // Fetch story

  stories.findOne({
    key: req.params.key
  }, function (err, doc) {

    if (doc) {

      res.send(editor({
        header: header,
        footer: footer,
        story: doc
      }));

    } else {

      res.status(404).send("Not found");

    }

  })

});

rf.server.post("/save", function (req, res) {

  if (!req.body.key) {

    if (req.body.title && req.body.author) {

      // Generate key and save

      require('crypto').randomBytes(48, function (err, buffer) {
        var key = buffer.toString('hex');

        stories.insert({
          title: req.body.title,
          author: req.body.author,
          email: req.body.email,
          text: req.body.text,
          key: key,
          date: Math.round((new Date()).getTime() / 1000)
        },
          function (err, result) {

            res.json({
              key: key,
              title: req.body.title
            });

          });

      });

    } else {

      res.status(400).send("No title or author");

    }

  } else {

    // Updating

    if (req.body.title && req.body.author) {

      stories.update({
        key: req.body.key
      }, {
        $set: {
          title: req.body.title,
          author: req.body.author,
          email: req.body.email,
          text: req.body.text
        }
      }, function (err, result) {

        res.json({
          key: req.body.key,
          title: req.body.title
        });

      });

    } else {

      res.status(400).send("No title or author");

    }

  }

});
