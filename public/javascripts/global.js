//  Global js functions

var socket = io.connect();


$(document).ready(function(){

	socket.on("addItemToList", function(itemObj){
		$("#todoListContainer").prepend(markupItemRow(itemObj));
	});

	var todoList = new TodoList();
	todoList.getTodoList($("#todoListContainer"));

	$("#addItemForm").on("submit", function(event){
		event.preventDefault();
		var addItemField = $("#addItemField");
		var item = new Item($.trim(addItemField.val()));
		if(item.description != ""){
			todoList.addItemToList($("#todoListContainer"), item);
		}
		else{
			alert("NOT VALID!");
		}
	});

	$("#testerBtn").on("click", function(){
		sendTest();
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
	this.deleted = false;
	this.crtDate = "";
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
			this.id = data._id;
			this.crtDate = data.crtDate;
			this.chgDate = data.chgDate;
			container.html(markupTodoList(data));
		}, this)
	});
}

TodoList.prototype.addItemToList = function(container, item){

	$.ajax({
		cache : false,
		type : "POST",
		url  : "/todo/todolist/",
		data : {item : item, listId : this.id},
		success : function(data){  //  data is the proccesed item with an _id
			if(data){
				$("#addItemField").val("");
				if(data.alreadyAdded){
					alert("findes allerede på listen.");
				}
				else{
					container.prepend(markupItemRow(data));
					socket.emit("addItemToList", data);  //  Let other clients know.	
				}				
			}
		}
	});
}

//  GUI functionality
function markupTodoList(todoList){

	var html = "";
	for(var i in todoList.items){
		console.log(todoList.items[i]);
		var checked = "";
		if(todoList.items[i].checked){
			checked = "checked='checked'";
		}

		html +=	"<tr id='" + todoList.items[i]._id + "'>" +
					"<td>" +
						"<label>" +
							"<input type='checkbox' " + checked + " /> " + todoList.items[i].description +
						"</label>" +
					"</td>" +
				"</tr>";
	}

	return html;
}

function markupItemRow(item){

	var checked = "";
	if(item.checked){
		checked = "checked='checked'";
	}
	var html =	"<tr id='" + item._id + "'>" +
					"<td>" +
						"<label>" +
							"<input type='checkbox' " + checked + " /> " + item.description +
						"</label>" +
					"</td>" +
				"</tr>";

	return html;
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

