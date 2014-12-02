var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
	res.render("index", { title: 'Express' });
});



router.get("/userlist", function(req, res){
	var db = req.db;
	var userList = db.get("usercollection");
	userList.find({}, {}, function(e, docs){
		res.render("userlist", {userlist : docs});
	});
});

router.get("/createuser", function(req, res){
	res.render("createuser", {title : "Create new user:"});
});

/**
 * Add new user
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
router.post("/adduser", function(req, res){
	var db = req.db;

	var username = req.body.username;
	var useremail = req.body.useremail;

	var userList = db.get("usercollection");

	userList.insert({
		"username" : username,
		"useremail" : useremail
	}, function(err, docs){
		if(err){
			console.log("failed to add user: " + username + " email: " + useremail);
			res.send("Error occured.");
		}
		else{
			res.location("userlist");
			res.redirect("userlist");
		}
	});
});


router.post("/deleteuser", function(req, res){
	var db = req.db;

	var userId = req.body.userId;

	var userList = db.get("usercollection");
	userList.remove({
		"_id" : ObjectId(userId)
	}, function(err, docs){
		res.location("userlist");
		res.redirect("userlist");
	});
});



module.exports = router;
