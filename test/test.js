var request = require('supertest'), express = require('express');

var app = require('../app');

var mongo = require('mongoskin');
var db = mongo.db("mongodb://localhost:27017/livestream-directors", {
	native_parser : true
});

describe('Director API', function() {

	it('should exist', function(done) {
		request(app).get('/').expect(200, done);
	});

	it('should add a new director', function(done) {
		var director = {
			"livestream_id" : "6488818"
		};

		request(app).post("/directors").send(director).expect(200).expect('Content-Type', /json/).expect(getCorrectDirector).end(function(err, res) {
			if (err) {
				done(err);
			} else {
				done();
			}
		});
	});

	it('should list all directors', function(done) {
		var spielburg = {
			"livestream_id" : "6488834"
		};
		request(app).post("/directors").send(spielburg).expect(200).expect('Content-Type', /json/).end(function(err, res) {
			if (err) {
				done(err);
			} else {
				request(app).get("/directorlist").expect(200).expect(allDirectorsRetrieved).end(function(err1, res1) {
					if (err1) {
						done(err1);
					} else {
						done();
					}
				});
			}
		});
	});

	it('should update director information', function(done) {
		var spielburg = {
			"livestream_id" : "6488834",
			"favorite_camera" : "Sony",
			"favorite_movies" : ["Toy Story", "When Harry Met Sally"]
		};
		request(app).post("/director/" + spielburg.livestream_id).send(spielburg).expect(200).expect(noErrorMsg).end(function(err, res) {
			if (err) {
				done(err);
			} else {
				request(app).post("/directors").send(spielburg).expect(200).expect(directorUpdatedOnce).end(function(err, res) {
					if (err) {
						done(err);
					} else {
						spielburg.favorite_camera = "Panasonic";
						spielburg.favorite_movies = ["Up"];
						request(app).post("/director/" + spielburg.livestream_id).send(spielburg).expect(200).expect(noErrorMsg).end(function(err1, res1) {
							if (err1) {
								done(err1);
							} else {
								request(app).post("/directors").send(spielburg).expect(200).expect(directorUpdatedTwice).end(function(err, res) {
									if (err) {
										done(err);
									} else {
										done();
									}
								});
							}
						});
					}
				});
			}
		});
	});

	it('should delete directors', function(done) {
		var scorsese = {
			"livestream_id" : "6488818"
		}, spielburg = {
			"livestream_id" : "6488834"
		};
		request(app).del("/deletedirector/" + scorsese.livestream_id).expect(200).expect('Content-Type', /json/).expect(noErrorMsg).end(function(err, res) {
			if (err) {
				done(err);
			} else {
				request(app).del("/deletedirector/" + spielburg.livestream_id).expect(200).expect('Content-Type', /json/).expect(noErrorMsg).end(function(err, res) {
					if (err) {
						done(err);
					} else {
						request(app).get("/directorlist").expect(200).expect(noDirectorsRetrieved).end(function(err, res) {
							if (err) {
								done(err);
							} else {
								done();
							}
						});
					}
				});
			}
		});
	});
});

function getCorrectDirector(res) {
	if (res.body.full_name !== "Martin Scorsese")
		return "incorrect director retrieved";
}

function allDirectorsRetrieved(res) {
	if (res.body.length !== 2) {
		return "not all directors retrieved expected: 2 actual: " + res.body.length;
	}
}

function noDirectorsRetrieved(res) {
	if (res.body.length !== 0) {
		return "not all directors retrieved expected: 0 actual: " + res.body.length;
	}
}

function directorUpdatedOnce(res) {
	if (res.body.favorite_camera !== "Sony") {
		return "favorite camera was not updated correctly. Expected: \"Sony\" Actual: " + res.body.favorite_camera;
	}
	if (res.body.favorite_movies[0] !== "Toy Story" && res.body.favorite_movies[0] !== "When Harry Met Sally") {
		return "favorite movies was not updated correctly. Expected: \"[Toy Story, When Harry Met Sally]\" Actual: " + res.body.favorite_movies;
	}
}

function directorUpdatedTwice(res) {
	if (res.body.favorite_camera !== "Panasonic") {
		return "favorite camera was not updated correctly. Expected: \"Panasonic\" Actual: " + res.body.favorite_camera;
	}
	if (res.body.favorite_movies[0] !== "Up") {
		return "favorite movies was not updated correctly. Expected: \"[Up]\" Actual: " + res.body.favorite_movies;
	}
}

function noErrorMsg(res) {
	if (res.body.msg !== "") {
		return "Error: " + res.body.msg;
	}
}
