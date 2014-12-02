//  Global js functions

$(document).ready(function(){


	var socket = io.connect();


	var todoList = new TodoList();
	todoList.getTodoList($("#todoListContainer"));

	$("#addItemBtn").on("click", function(){
		var addItemField = $("#addItemField");
		var item = new Item($.trim(addItemField.val()));

		if(item != ""){
			todoList.addItemToList(item);			
		}
		else{
			alert("NOT VALID!");
		}
	});






});

/************************************************************************
 * Item functionality
 ***********************************************************************/

/**
 * Item constructor
 * @param string description
 */
function Item (description){
	this.id = "";
	this.description = description;
	this.checked = false;
	this.deleted = false;
}

/**
 * Edit item
 * @param object attrObj . Object of properties to edit on item object.
 */
Item.prototype.editItem = function(attrObj){
	for(var i in attrObj){
		if(this.hasOwnProperty(i)){
			this[i] = attrObj[i];			
		}
	}
}

/************************************************************************
 * Todo list functionality
 ***********************************************************************/

function TodoList(){
	this.id = "";
	this.title = "";
	this.items = new Array();
	this.crtDate = "";
	this.chgDate = "";
}

TodoList.prototype.getTodoList = function(container, listId){

	if(listId == undefined){  //  Get last changed list
		listId = 0;
	}

	$.ajax({
		cache : false,
		type : "GET",
		url : "/todo/todolist/" + listId,
		dataType : "json",
		success : $.proxy(function(data){  //  make the success callback's context point to TodoList obj. (this)
			console.log(data);
			this.id = data[0]._id;
			this.crtDate = data[0].crtDate;
			this.chgDate = data[0].chgDate;
		}, this)
	});
}

TodoList.prototype.addItemToList = function(item){
	console.log(this);
	console.log(item);
	$.ajax({
		cache : false,
		type : "POST",
		url  : "/todo/todolist/",
		data : {item : item, listId : this.id},
		success : function(data){
			console.log(data)
		}
	});
}

/************************************************************************
 * Helper functions
 ***********************************************************************/

/**
 * Get a date time obj of "now"
 * @return object 
 */
function getNow(){
	var date = new Date();
	
	var day = date.getDate().toString();
	if(day.length == 1){
		day = "0" + day;
	}
	var month = date.getMonth().toString();
	if(month.length == 1){
		month = "0" + month;
	}
	var hours = date.getHours().toString();
	if(hours.length == 1){
		hours = "0" + hours;
	}
	var minutes = date.getMinutes().toString();
	if(minutes.length == 1){
		minutes = "0" + minutes;
	}
	var seconds = date.getSeconds().toString();
	if(seconds.length == 1){
		seconds = "0" + seconds;
	}
	
	return {
		date : date.getFullYear() + "-" + month + "-" + day,
		time : hours + ":" + minutes + ":" + seconds
	}
}


