// Grab the items as a json
$.getJSON("/items", function (data) {
  // For each one
  for (var i = 0; i < data.length; i++) {
    // Display the apropos information on the page
    $("#items")
      .append(
        "<div id='D" + data[i]._id + "'data-id='" + data[i]._id + "'>" +
        "<img class='item-photo' src=" + data[i].imgSource + " alt='auction item photo'/>" +
        "<h2><a href=" + data[i].link + " target='_blank'>" + data[i].title + "</a></h2>" +
        "<p class='item-subtitle'>" + data[i].subtitle + "</p>" +
        "<p class='item-price'>" + data[i].price + "</p>" +
        "<div class='item-buttons'>" +
        "<button class='btn-annotate' data-id='" + data[i]._id + "'>Annotate</button>" +
        "<button id='C" + data[i]._id + "' class='btn-delete-X' data-id='" + data[i]._id + "'>Delete</button>" +
        "<button id='X" + data[i]._id + "' class='btn-cancel-X' data-id='" + data[i]._id + "'>Cancel</button>" +
        "</div>" +
        "</div>");
  }
});

// scrape items from ebay
$(document).on("click", "#scrape-now", () => {
  // console.log("clicked scrape button")
  $("#items").html("Loading...");
  $.ajax({
      method: "GET",
      url: "scrape"
    })
    // With that done, add the note information to the page
    .then(function (data) {
      $("#items").html("");
      $.getJSON("/items", function (data) {
        // For each one
        for (var i = 0; i < data.length; i++) {
          // Display the apropos information on the page
          $("#items")
            .append(
              "<div id='D" + data[i]._id + "'data-id='" + data[i]._id + "' class='item-aux'>" +
              "<img class='item-photo' src=" + data[i].imgSource + " alt='auction item photo'/>" +
              "<h2><a href=" + data[i].link + " target='_blank'>" + data[i].title + "</a></h2>" +
              "<br />" + data[i].subtitle +
              "<br />" + data[i].price +
              "<button class='btn-annotate' data-id='" + data[i]._id + "'>Annotate</button>" +
              "<button id='C" + data[i]._id + "' class='btn-delete-X' data-id='" + data[i]._id + "'>Delete</button>" +
              "<button id='X" + data[i]._id + "' class='btn-cancel-X' data-id='" + data[i]._id + "'>Cancel</button></div>");
        }
      });
      // location.reload();
      // $("#items").load(location.href + " #items");
      // $("#D"+targetItem).slideUp(1000)
      // .then(() => {});// console.log("it worked");
    });
})

// cancel deletion of single item
$(document).on("click", ".btn-cancel-X", (evt) => {
  evt.preventDefault();
  // var btnText = evt.target.textContent;
  var targetItem = evt.target.getAttribute("data-id");
  $("#C" + targetItem).text("Delete");
  $("#X" + targetItem).hide();
});

// delete a single item
$(document).on("click", ".btn-delete-X", (evt) => {
  evt.preventDefault();
  var btnText = evt.target.textContent;
  var targetItem = evt.target.getAttribute("data-id");
  console.log(evt)
  if (btnText == "Delete") {
    evt.target.textContent = "Confirm?";
    $("#X" + targetItem).show();
  } else if (btnText == "Confirm?") {
    evt.target.textContent = "Delete"
    $.ajax({
        method: "GET",
        url: "deleteItem/" + targetItem
      })
      .then(function (data) {
        console.log("#D" + targetItem);
        $("#D" + targetItem).slideUp(1000)
          .then(() => {});
      });
  }
});

// delete all items -- with timeout
$(document).on("click", "#clear-all", () => {
  if ($("#clear-all").text() == "Clear All") {
    $("#clear-all").text("Confirm?");
    var remTime = 5;
    $("#btn-cancel-A").show();
    var timeout = setTimeout(function () {
      var countdown = setInterval(function () {
        remTime--;
        if (remTime == 0) {
          clearInterval(countdown);
          $("#clear-all").text("Clear All");
          $("#btn-cancel-A").hide();
        }
      }, 1000);
    }, 5 * 1000);
  } else if ($("#clear-all").text() == "Confirm?") {
    console.log("deleting everything")
    $.ajax({
        method: "POST",
        url: "/deleteAllItems/",
        success: {

        }
      })
      // With that done, add the note information to the page
      .then(function (data) {
        location.reload();
        console.log("it worked")
      });
    $("#btn-cancel-A").hide();
    $("#clear-all").text("Clear All");
  }
});

$(document).on("click", "#btn-cancel-A", () => {
  $("#btn-cancel-A").hide();
  $("#clear-all").text("Clear All");
  // clearInterval(countdown);   
});

// Whenever someone clicks a p tag
$(document).on("click", ".btn-annotate", function () {
  // Empty the notes from the note section
  console.log("the click worked")
  $("#notes").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");

  // Now make an ajax call for the item
  $.ajax({
      method: "GET",
      url: "/items/" + thisId
    })
    // With that done, add the note information to the page
    .then(function (data) {
      console.log(data);
      // The title of the item
      $("#notes").append("<h2>" + data.title + "</h2>");
      // An input to enter a new title
      $("#notes").append("<input id='titleinput' name='title' >");
      // A textarea to add a new note body
      $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
      // A button to submit a new note, with the id of the item saved to it
      $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");
      $("#notes").append("<button data-id='" + data._id + "' id='deletenote'>Delete Note</button>");
      // If there's a note in the item
      if (data.note) {
        // Place the title of the note in the title input
        $("#titleinput").val(data.note.title);
        // Place the body of the note in the body textarea
        $("#bodyinput").val(data.note.body);
      }
    });
});

// When you click the savenote button
$(document).on("click", "#savenote", function () {
  // Grab the id associated with the item from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
      method: "POST",
      url: "/items/" + thisId,
      data: {
        // Value taken from title input
        title: $("#titleinput").val(),
        // Value taken from note textarea
        body: $("#bodyinput").val()
      }
    })
    // With that done
    .then(function (data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});

// When you click the deletenote button
$(document).on("click", "#deletenote", function () {
  // Grab the id associated with the item from the submit button
  console.log("clicked delete note");
  var thisId = $(this).attr("data-id");
  // console.log(thisId)
  var noteToDelete;
  $.ajax({
    method: "GET",
    url: "/items/" + thisId
  }).then((data) => {
    noteToDelete = data.note._id;
  }).then(() => {
    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
        method: "POST",
        url: "/deleteNote/" + noteToDelete,
      })
      // With that done
      .then(function (data) {
        // Empty the notes section
        $("#notes").empty();
      });
  });
  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});