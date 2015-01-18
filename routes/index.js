var express = require('express');
var https = require('https');
var bl = require('bl');
var sanitize = require('mongo-sanitize');
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
		res.setHeader('Content-Type', 'application/json');
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
		livestream_id : sanitize(+id)
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
	var director = req.params.id;
	db.collection('directorlist').findOne({//is this id in our database?
		livestream_id : +director
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
			//console.log(req.body);
			var movies = sanitize(req.body.favorite_movies);
			if ( typeof movies === "string") {
				res.send({
					msg : "Favorite movies must be sent as an array."
				});
				res.end();
				return;
			}
			for (var i = 0; i < movies.length; i++) {
				movies[i] = movies[i].trim();
			};

			db.collection('directorlist').update({
				livestream_id : +director
			}, {
				'$set' : {
					favorite_camera : sanitize(req.body.favorite_camera),
					favorite_movies : movies
				}
			}, function(err, result) {
				if (err) {
					res.setHeader('Content-Type', 'application/json');
					res.send({
						msg : "Director could not be updated."
					});
					res.end();
					return;
				} else if (result) {
					res.setHeader('Content-Type', 'application/json');
					res.send({
						msg : ""
					});
					res.end();
					return;
				}
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
	db.collection('directorlist').remove({
		livestream_id : sanitize(+userToDelete)
	}, function(err, result) {
		res.setHeader('Content-Type', 'application/json');
		res.send((result === 1) ? {
			msg : ''
		} : {
			msg : err
		});
	});
});

module.exports = router;

