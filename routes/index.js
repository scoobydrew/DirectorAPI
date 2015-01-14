var express = require('express');
var https = require('https');
var bl = require('bl');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
	res.render('index', {
		title : 'Express'
	});
});

/*
 * GET director list.
 */
router.get('/directorlist', function(req, res) {
	var db = req.db;
	db.collection('directorlist').find().toArray(function(err, items) {
		res.json(items);
	});
});

/*
 * POST to add director.
 */
router.post('/directors', function(req, res) {
	var db = req.db;
	var id = req.body.livestream_id;
	db.collection('directorlist').findOne({//is this id in our database?
		livestream_id : +id
	}, function(e, result) {
		if (e !== null) {
			res.status(500).send("Database error");
			res.end();
			return;
		}
		if (result === null) {// if not, get the information from the Livestream API
			var options = {
				host : 'api.new.livestream.com',
				port : 443,
				path : '/accounts/' + id,
				method : 'GET'
			};

			var request = https.request(options, function(res1) {
				console.log("Livestream returned status: " + res1.statusCode);
				res1.pipe(bl(function(err, data) {
					result = JSON.parse(data.toString());
					var director = {
						livestream_id : result.id,
						full_name : result.full_name,
						dob : result.dob,
						favorite_camera : "",
						favorite_movies : []
					};
					db.collection('directorlist').insert(director, function(err, result) {// save the new data so we have it for next time
						if (err === null) {
							res.setHeader('Content-Type', 'application/json');
							res.json(director);
						} else {
							res.send(err);
						}
					});
				}));
			});
			request.on('error', function(e) {
				console.error(e);
			});
			request.end();
		} else {// if we had the data, send it back
			res.setHeader('Content-Type', 'application/json');
			res.json(result);
		}
	});
});
/*
 * POST to update director.
 */
router.post('/director/:id', function(req, res) {
	var db = req.db;
	var director = req.body._id;
	db.collection('directorlist').findOne({//is this id in our database?
		_id : +director
	}, function(e, result) {
		if (e !== null) {
			res.status(500).send("Database error");
			res.end();
			return;
		}
		if (result === null) {
			res.send({
				msg : "No record with this livestream id exists in the directors database."
			});
			res.end();
			return;
		} else {		
			db.collection('directorlist').update({
				_id : req.body._id
			}, {
				'$set' : {
					favorite_camera : req.body.favorite_camera,
					favorite_movies : req.body.favorite_movies
				}
			}, function(err, result) {
				if (err)
					throw err;
				if (result)
					console.log('Updated!');
			});
		}
	});
});

/*
 * DELETE to delete director.
 */
router.delete('/deletedirector/:id', function(req, res) {
	var db = req.db;
	var userToDelete = req.params.id;
	db.collection('directorlist').removeById(userToDelete, function(err, result) {
		res.send((result === 1) ? {
			msg : ''
		} : {
			msg : 'error: ' + err
		});
	});
});

module.exports = router;

