var express = require("express");
var bodyParser = require("body-parser");
// var logger = require("morgan");
var mongoose = require("mongoose");
var request = require("request");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
// var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
// app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// Connect to the Mongo DB
// mongoose.connect("mongodb://localhost/ebayScraper");
mongoose.connect("mongodb://heroku_kqxh70dp:12arfqkbguodmuu8uognl1cl8j@ds261450.mlab.com:61450/heroku_kqxh70dp")

// Routes

app.get('/', function() {
  res.sendFile(index.html);
});

// A GET route for scraping the ebay website
app.get("/scrape", function(req, res) {
  // grab the body of the html with axios
  // console.log("scraping....")
  request(
    "https://www.ebay.com/b/Laptops-Netbooks/175672/bn_1648276?LH_Auction=1",
    function(error, response, html) {
      // Load the HTML into cheerio and save it to a variable
      var $ = cheerio.load(html);
      // get relevant information from ebay item listings.
      $("div.s-item__wrapper.clearfix").each(function(i, element) {
        var result = {};
        result.title = $(element)
          .find("div.s-item__info")
          .find("a")
          .find("h3.s-item__title")
          .text();
        result.subtitle = $(element)
          .find("div.s-item__info")
          .find("div.s-item__subtitle")
          .text();
        result.link = $(element)
          .find("div.s-item__info")
          .find("a")
          .attr("href");
        result.price = $(element)
          .find("div.s-item__info")
          .find("div.s-item__details")
          .find("div.s-item__detail")
          .find("span.s-item__price")
          .text();
        result.imgSource = $(element)
          .find("div.s-item__image-section")
          .find("div.s-item__image")
          .find("a")
          .find("div.s-item__image-wrapper")
          .find("img")
          .attr("src");

        // Create a new Item using the `result` object built from scraping
        db.Item.create(result)
          .then(function(dbItem) {
            // not doing anything Headers
          })
          .catch(function(err) {
            // If an error occurred, send it to the client
            console.log(err);
          });

        // If we were able to successfully scrape and save an auction item, send a message to the client
      });
      res.redirect("/");
    }
  );
});

// Route for getting all auction items from the db
app.get("/items", function(req, res) {
  // Grab every document in the auction items collection
  db.Item.find({})
    .then(function(dbItem) {
      // If we were able to successfully find auction items, send them back to the client
      res.json(dbItem);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

//delete inidicated item from database.
app.get("/deleteItem/:id", function(req, res) {
  db.Item.findByIdAndRemove(req.params.id, () => {
    // res.redirect('/');
    // db.Item.deleteOne({_id:req.params.id});
  });
  res.redirect("/");
});

app.post("/deleteAllItems/", function(req, res) {
  db.Item.deleteMany({})
    .then(() => {
      console.log("deleting");
    })
    .then(response => {
      res.redirect("/");
    });
});


// Route for grabbing a specific auction item by id, populate it with it's note
app.get("/items/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Item.findOne({
    _id: req.params.id
  })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbItem) {
      // If we were able to successfully find an auction item with the given id, send it back to the client
      res.json(dbItem);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an auction item's associated Note
app.post("/items/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one auction item with an `_id` equal to `req.params.id`. Update the auction item to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Item.findOneAndUpdate(
        {
          _id: req.params.id
        },
        {
          note: dbNote._id
        },
        {
          new: true
        }
      );
    })
    .then(function(dbItem) {
      // If we were able to successfully update an auction item, send it back to the client
      res.json(dbItem);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for deleting an auction item's associated Note
app.post("/deleteNote/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.findByIdAndRemove(req.params.id, () => {
  })
    .then(function(dbItem) {
      // If we were able to successfully update an auction item, send it back to the client
      res.redirect("/");
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      // res.json(err);
      // });
    });
});

// Route for deleting an auction item's associated Note
app.post("/deleteAllNotes/", function(req, res) {
  // Create a new note and pass the req.body to the entry
  console.log("made it to delete all notes");
  db.Note.deleteMany({})
    .then(() => {
      console.log("deleting all notes");
    })
    .then(response => {
      res.redirect("/");
    });
});
  
  
// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
