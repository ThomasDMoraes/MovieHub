//movieserver.js

//SearchMovie IMDB API
//Title IMDB API
//Ratings IMDB API
//Top250Movies IMDB API
//MostPopularMovies IMDB API (bonus later on)

//watchlist (4): LIST movies in watchlist, VIEW a movie's details in the watchlist, ADD / DELETE a movie from it
//try making a new database collection for the watchlist. Might be the only use for Mongo, maybe logins also

//*routes will require a user to be logged in*




//importing modules
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const res = require('express/lib/response');
const fetch = require('node-fetch'); //running version 2 since ESM wasn't working
const fs = require('fs');
const MongoClient = require('mongodb').MongoClient;

//allows data retrieval without using an HTML document form
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('./public'));

//Allowing website connections without triggering a CORS error (as shown in the lecture)
app.use((req, res, next) => {
  //Specifying website to allow
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  //Specifying request method types to allow from the website
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  //Specifying request headers to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type');
  //Not allowing credential information (cookies)
  res.setHeader('Access-Control-Allow-Credentials', false);

  next();
})


//IMDB endpoints: ----------------------------------------------------

//Getting the API key from a JSON config file
const imdbKey = (JSON.parse(fs.readFileSync("backend/APIkey.json", "utf8"))).APIkey;

//SearchMovies IMDB API
app.get('/search', function(req, res) {

    //for debugging (inside movie search route)
    console.log("STATUS: searchMovie request!");

    //URL of IMDB endpoint for external GET request
    //title is the user search parameter
    var url = "https://imdb-api.com/en/API/SearchMovie/" + imdbKey + "/" + req.query.title;
    
    //fetching data from the IMDB database
    fetch(url)
        //converting retrieved text data to json
        .then(res => res.json())
        //sending back response with retrieved JSON object
        .then(data => {
            console.log("MovieSearch FETCH successful!");
            res.status(200).send(data);
        })
        .catch(err => {
            console.log("MovieSearch FETCH Error!");
            res.status(500).send(err);
        });
})

//Title IMDB API
app.get('/title', function(req, res) {

    //for debugging (inside movie search route)
    console.log("STATUS: Title (info) request!");

    //URL of IMDB endpoint for external GET request
    //movie_id is the user search parameter
    var url = "https://imdb-api.com/en/API/Title/" + imdbKey + "/" + req.query.movie_id;
    
    //fetching informational data for the movie corresponding movie_id from the IMDB database 
    fetch(url)
        //converting retrieved text data to json
        .then(res => res.json())
        //sending back response with retrieved JSON object
        .then(data => {
            console.log("Title FETCH successful!");
            res.status(200).send(data);
        })
        .catch(err => {
            console.log("Title FETCH Error!");
            res.status(500).send(err);
        });
})

//Ratings IMDB API
app.get('/rating', function(req, res) {

    //for debugging (inside movie search route)
    console.log("STATUS: Rating request!");

    //URL of IMDB endpoint for external GET request
    //movie_id is the user search parameter
    var url = "https://imdb-api.com/en/API/Ratings/"  + imdbKey + "/" + req.query.movie_id;
    
    //fetching ratings of movie corresponding the given movie_id from the IMDB database
    fetch(url)
        //converting retrieved text data to json
        .then(res => res.json())
        //sending back response with retrieved JSON object
        .then(data => {
            console.log("Ratings FETCH successful!");
            res.status(200).send(data);
        })
        .catch(err => {
            console.log("Ratings FETCH Error!");
            res.status(500).send(err);
        });
})

//Top250Movies IMDB API
app.get('/top250', function(req, res) {

    //for debugging (inside movie search route)
    console.log("STATUS: Top250Movies request!");

    //URL of IMDB endpoint for external GET request
    var url = "https://imdb-api.com/en/API/Top250Movies/" + imdbKey;
    
    //fetching the top 250 movies of movies from the IMDB database
    fetch(url)
        //converting retrieved text data to json
        .then(res => res.json())
        //sending back response with retrieved JSON object
        .then(data => {
            console.log("Top250Movies FETCH successful!");
            res.status(200).send(data);
        })
        .catch(err => {
            console.log("Top250Movies FETCH Error!");
            res.status(500).send(err);
        });
})


//Watchlist (MongoDB): ----------------------------------------------------

//Add route method
//adds a movie to the watchlist collection in MongoDB given the movie ID
//a movie should be added when clicked on a button for the frontend, sending the movie's ID
app.post('/addToWatchlist', function(req, res) {

})









//outputting the server address to the console
//server listens on port 5500
var server = app.listen(5500, function() {
    var port = server.address().port;
    console.log('port:', port);
    console.log('Server is running at http://localhost:' + port);
})