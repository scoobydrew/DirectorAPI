// Userlist data array for filling in info box
var userListData = [];

// DOM Ready =============================================================
$(document).ready(function() {
	populateTable();
	$('#userList table tbody').on('click', 'td a.linkshowdirector', showUserInfo);
	// Add User button click
	$('#btnTest').on('click', addUser);
});

// Functions =============================================================

// Fill table with data
function populateTable() {
	// Empty content string
	var tableContent = '';

	// get all directors
	$.getJSON('/directorlist', function(data) {
		// For each item in our JSON, add a table row and cells to the content string
		$.each(data, function() {
			tableContent += '<tr>';
			tableContent += '<td><a href="#" class="linkshowdirector" rel="' + this.livestream_id + '" title="Show Details">' + this.full_name + '</a></td>';
			tableContent += '<td>' + this.dob + '</td>';
			tableContent += '<td><a href="#" class="linkdeleteuser" rel="' + this._id + '">delete</a></td>';
			tableContent += '</tr>';
		});

		// Inject the whole content string into our existing HTML table
		$('#userList table tbody').html(tableContent);
	});
};

// Show User Info
function showUserInfo(event) {

	// Prevent Link from Firing
	event.preventDefault();

	// Retrieve username from link rel attribute
	var thisLivestreamId = $(this).attr('rel');

	var reqData = {
		'livestream_id' : thisLivestreamId
	};
	// it would be better to cache this data on the client, but to test that subsequent posts to this address 
	// go to the DB rather than the livestream API we are going to the webserver again and make sure it doesn't run a GET
	$.ajax({ 
		type : 'POST',
		data : reqData,
		url : '/directors',
		dataType : 'JSON'
	}).done(function(data) {
		//Populate Info Box
		$('#dirName').text(data.full_name);
		$('#dirDOB').text(data.dob);
		$('#dirFavoriteCam').text(data.favorite_camera);
		$('#dirMovies').text(data.favorite_movies.toString());
	});
};

// Add User
function addUser(event) {
	event.preventDefault();

	// Super basic validation - increase errorCount variable if any fields are blank
	var errorCount = 0;
	$('#addUser input').each(function(index, val) {
		if ($(this).val() === '') {
			errorCount++;
		}
	});

	// Check and make sure errorCount's still at zero
	if (errorCount === 0) {

		// If it is, compile all user info into one object
		var newUser = {
			'livestream_id' : $('#addUser fieldset input#inputLivestreamId').val()
		};

		// Use AJAX to post the object to our adduser service
		$.ajax({
			type : 'POST',
			data : newUser,
			url : '/directors',
			dataType : 'JSON'
		}).done(function(data){
			populateTable();
		});
	} else {
		// If errorCount is more than 0, error out
		alert('Please fill in all fields');
		return false;
	}
};

// Delete User
function deleteUser(event) {

	event.preventDefault();

	// Pop up a confirmation dialog
	var confirmation = confirm('Are you sure you want to delete this user?');

	// Check and make sure the user confirmed
	if (confirmation === true) {

		// If they did, do our delete
		$.ajax({
			type : 'DELETE',
			url : '/users/deleteuser/' + $(this).attr('rel')
		}).done(function(response) {

			// Check for a successful (blank) response
			if (response.msg === '') {
			} else {
				alert('Error: ' + response.msg);
			}

			// Update the table
			populateTable();

		});

	} else {

		// If they said no to the confirm, do nothing
		return false;

	}

};

