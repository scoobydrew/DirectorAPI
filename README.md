# DirectorAPI
Experimenting with Node.JS and external site APIs.

## Setup
Clone the repository into the directory of your choosing.  You will need to have Node.JS installed to run the webserver. 
 
If you have installed it, run the following command to install dependencies: `npm install`

You well also need mongoDB installed.  You can find installers on their [site](http://www.mongodb.org/downloads). You can also
find installation guides [here](http://docs.mongodb.org/manual/installation/) to help you get up and running with mongo.

I decided to keep my database files contained in a subdirectory of the project.  From the directory where you cloned the project,
make a subdirectory called 'data' and then start up mongodb by running this command:
`mongod --dbpath <your_project_directory>/data`

Leave mongod running in the background and start the webserver by going to the root directory of the project and running:
`npm start`

## The API
The webserver runs on localhost listening on port 3000.  You can interact with the api using the following addresses:

### GET '/'
Displays the basic test page I used while building the website.

### GET '/directorlist'
Returns all directors in the database as an array of JSON objects with the format: 
```
{ "livestream_id":<string>,
  "full_name":<string>,
  "dob":<datetime formatted string>,
  "favorite_camera":<string>,
  "favorite_movies":<array> }
```

### POST '/directors'
Given a JSON object with the format `{ "livestream_id":"6488818" }` queries the database for a director with the given livestream
id.  If no director is found, it makes a GET request to the livestream API and adds the director to the database.  Finally, it 
always returns a director JSON object in the same format given about.

### POST '/director/:id'
Given a JSON object with the format `{ favorite_camera : <string>, favorite_movies : <array> }` queries the database for a 
director with the livestream_id field equal to the :id parameter.  If it exists, it updates the two fields with the data in the
given JSON object.  If the director does not exist, returns a JSON object with a `msg` field describing the error.

## Testing
You can run `make test` from a command prompt to run automated tests on the API.  The tests add two directors, list them, update 
them, and delete them.  They essentially validate basic CRUD functions. 
