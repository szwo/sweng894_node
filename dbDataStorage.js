var DataValidator = require ('./dataValidator.js');

var mongoose = require("mongoose");
mongoose.connect("mongodb://35.185.38.132:18555/trucks");

var db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error"));
db.once("open", function(callback) {
    console.log("Connection succeeded.");
});

var Schema = mongoose.Schema;
var userSchema = new Schema({
	username: String,
	password: String,
	menu:
	[
		{
			name: String,
			price: Number
		}
	]
});

var reviewSchema = new Schema({
	vendorUsername:String,
	comment: String,
	rating: Number
});

var eventSchema = new Schema({
	id:Number,
	vendorUsername:String,
	saleDescription:String,
	start:String,
	end:String,
	address:String
});

module.exports.handleCreateAccountPost = function(request)
{
	 var User = mongoose.model("user", userSchema);
	 
	 var thisUser = new User({
	     username: request.body.username,
	     password: request.body.password
	 });
	 
	 thisUser.save(function(error) {
	     console.log("User has been saved!");
	 if (error) {
	     console.error(error);
	  }
	 });
};

module.exports.handleEventPost = function(request)
{
  	var Event = mongoose.model("event", eventSchema);
	 
	 var thisEvent = new Event({
	        id:request.body.id,
		vendorUsername:request.body.vendorUsername,
		saleDescription:request.body.saleDescription,
		start:request.body.start,
		end:request.body.end,
		address:request.body.address
	 });
	 
	 thisEvent.save(function(error) {
	     console.log("Event has been saved!");
	 if (error) {
	     console.error(error);
	  }
	 });
};

module.exports.handleReviewPost = function(request)
{
	var Review = mongoose.model("review", reviewSchema);
		 
	 var thisReview = new Review({
		vendorUsername: request.body.vendorUsername,
		comment: request.body.comment,
		rating: request.body.rating
	 });
	 
	 thisReview.save(function(error) {
	     console.log("Review has been saved!");
	 if (error) {
	     console.error(error);
	  }
	 });
};

module.exports.handleVendorPost = function(request)
{
	console.log(request.body);
	var jsonContent = readDataStore('vendor.json');
	jsonContent.push(request.body);
	fs.writeFile('vendor.json', JSON.stringify(jsonContent), (err) => {
    if (err) throw err;
    console.log('Data written to file');
  });
  return 'OK';
};

module.exports.handleGetReviews = function(fs, requestedUsername)
{
 	var Review = mongoose.model("review", reviewSchema);

	return Review.find({vendorUsername: requestedUsername});
}

module.exports.handleGet = function(fs, requestedUser)
{
  	var User = mongoose.model("user", userSchema);

	return User.find({username: requestedUser});
};

module.exports.handleGetEvents = function(fs)
{
  var jsonContent = readDataStore('events.json');
  for (entry in jsonContent) {
    var jsonVendorContent = readDataStore('vendor.json');
    for (vendor in jsonVendorContent) {
      if(jsonVendorContent[vendor].username == jsonContent[entry].vendorUsername) {
        jsonContent[entry].vendor = jsonVendorContent[vendor];
        break;
      }
    }
  }
  return jsonContent;
}

module.exports.handleGetEvent = function(fs, id)
{
  var jsonContent = readDataStore('events.json');
  var foundEvent = {};
  for (event in jsonContent) {
    if(jsonContent[event].id == id) {
      foundEvent = jsonContent[event];
      var jsonVendorContent = readDataStore('vendor.json');
      for (vendor in jsonVendorContent) {
        if(jsonVendorContent[vendor].username == foundEvent.vendorUsername) {
          foundEvent.vendor = jsonVendorContent[vendor];
          break;
        }
      }
      break;
    }
  }

  return foundEvent;
}

module.exports.handleGetVendor = function(fs, vendorId)
{
  var jsonContent = readDataStore('vendor.json');
  var foundUser = {};
  for (entry in jsonContent) {
    if(jsonContent[entry].id == vendorId) {
      foundUser = jsonContent[entry];
    }
  }

  return foundUser;
}

var readDataStore = function(fileName)
{
  var content = fs.readFileSync(fileName);
  return JSON.parse(content);
};
