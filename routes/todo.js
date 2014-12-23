var express = require("express");
var router = express.Router();

/* GET todo list */
router.get("/todolist/:id", function(req, res){
	var db          = req.db;
	var mongoHelper = req.mongoHelper;
	var id          = req.params.id;
	//var query = new Query();

	//console.log(id);

    db.collection("todoList").find().sort({ chgDate : -1 }).limit(1).toArray(function(err, items){

    	var todoList = items[0];
    	console.log(items);
    	function getListItems(itemsArr){
    		db.collection("items").find({ _id: { $in : itemsArr } }).sort({ crtDateTime : -1 }).toArray(function(err, items){
        		if(err){
        			console.log("Find items failed");
        		}
        		else{
        			todoList.items = items;
        			res.json(todoList);
        		}
        	});
    	}

        //  If there is result in db, else create a new list.
        if(items.length > 0){

        	//  Check for itmes
        	if(todoList.items != undefined && todoList.items.length > 0){
        		
        		var findItemsArr = new Array();

        		for(var i in todoList.items){
        			//  CONVERT TO OBJECT ID
	       			findItemsArr.push(mongoHelper.toObjectID(todoList.items[i].item));
        		}
        		getListItems(findItemsArr);
        	}
        	else{
        		todoList.items = "";
        		res.json(todoList);
        	}
        	
        }
        else{
        	db.collection("todoList").insert({
        		"title" : "First list",
        		"crtDate" : new Date,
        		"chgDate" : new Date
        	}, function(err, docs){
				if(err){
					console.log("Cant create list");
					res.send(err);
				}
				else{
					console.log(docs);
					res.json(docs[0]);
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
			db.collection("items").find({ $text : { $search : item.description } }).limit(1).toArray(function(err, items){

				function addItemToList(item){

					var itemLine = {
						"item" : item._id,
						"quantity" : 0,
						"checked" : item.checked,
						"crtDateTime" : new Date
					}

					db.collection("todoList").update({ _id : mongoHelper.toObjectID(listId) }, { $push : { "items" : itemLine } }, function(err, result){
						if(err){
							console.log("Failed to update list:");
							console.log(result);
						}
						else{
							res.json(item);
						}
					});
				}

				//  check if the item is already added to list
				function checkIfItemIsOnListAndAdd(item){
					db.collection("todoList").find({ _id : mongoHelper.toObjectID(listId) }, { items : 1 }).toArray(function(err, items){  //  Query only return the items field.
						if(err){
							console.log("list lookup failed");
						}
						else{
							var found = false;
							if(items.length > 0){
								var itemList = items[0].items;
								
								//  Look for the item in the list.
								for(i in itemList){
									if(itemList[i].item.toHexString() == item._id){
										found = true;
										break;
									}
								}
							}

							// check if item already is on this list.
							if(found){
								res.json({ alreadyAdded : true });
							}
							else{
								addItemToList(item);
							}
						}
					});
				}

				if(items.length > 0){  // adding existing item.
					if(listId){
						checkIfItemIsOnListAndAdd(items[0]);
					}
					else{
						console.log("No list id supplied");
					}
				}
				else{  //  new item
					db.collection("items").insert({
						"description" : item.description,
						"deleted" : item.deleted,
						"crtDateTime" : new Date
					}, function(err, docs){
						if(err){
							console.log("KUNNE IKKE OPRETTE:");
							console.log(item);
						}
						else{
							console.log("ADDIGN TO LIST.....");
							addItemToList(docs[0]);
							response = docs[0];
						}		
					});
				}
			});
		}		
	}
});


module.exports = router;
