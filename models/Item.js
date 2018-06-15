var mongoose = require("mongoose");
var Schema = mongoose.Schema;

// Using the Schema constructor, create a new UserSchema object
// This is similar to a Sequelize model
var ItemSchema = new Schema({
  // `title` is required and of type String
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    required: false
  },
  price: {
    type: String
  },
  imgSource: {
    type: String
  },
  link: {
    type: String,
    required: true
  },
  note: {
    type: Schema.Types.ObjectId,
    ref: "Note"
  }
});

// This creates our model from the above schema, using mongoose's model method
var Item = mongoose.model("Item", ItemSchema);

// Export the Article model
module.exports = Item;
