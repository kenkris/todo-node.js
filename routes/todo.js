var express = require("express");
var router = express.Router();

/* GET todo list */
router.get("/todolist/:id", function(req, res){
	var db = req.db;
	var id = req.params.id;
	//var query = new Query();

	console.log(id);

    db.collection("todoList").find().sort({chgDate : -1}).limit(1).toArray(function (err, items) {
        //  If there is result in db, else create a new list.
        if(items.length > 0){
        	res.json(items);
        }
        else{
        	db.collection("todoList").insert({
        		"title" : "Firt list",
        		"crtDate" : new Date,
        		"chgDate" : new Date
        	}, function(err, docs){
				if(err){
					console.log("Cant create list");
					res.send(err);
				}
				else{
					res.json(docs);	
				}
        	});
        }
    });
});

/* POST todo list */
router.post("/todolist", function(req, res){

	var db          = req.db;
	var mongoHelper = req.mongoHelper;
	var util        = req.util;
	var item        = req.body.item;
	var listId      = req.body.listId;
	var response    = false;  //  return value


	if(listId == undefined && listId.length > 0){
		listId = false;
	}
	

	if(!util.isEmptyObject(item)){
		if(item.id != ""){  //  If id is supplied, check if it exists and add directly to list.
			//  DO STUFF
			console.log("IF,,,,");
		}
		else{
			//  Check if there is an item with exact same name
			db.collection("items").find({$text : {$search : item.description}}).limit(1).toArray(function(err, items){
				
				function addItemToList(itemId){
					db.collection("todoList").update({ _id : mongoHelper.toObjectID(listId) }, { $push : { "items" : itemId } }, function(err, result){
						if(err){
							console.log("Failed to update list:");
							console.log(result);
						}
					});
				}

				if(items.length > 0){
					if(listId){
						addItemToList(items[0]._id);
					}
					else{
						console.log("No list id supplied");
					}
				}
				else{
					db.collection("items").insert({
						"description" : item.description,
						"checked" : item.checked,
						"deleted" : item.deleted
					}, function(err, docs){
						if(err){
							console.log("KUNNE IKKE OPRETTE:");
							console.log(item);
						}
						else{
							addItemToList(docs[0]._id);
							response = docs[0];
						}		
					});
				}
			});
		}		
	}
	res.send(response);
});


module.exports = router;
