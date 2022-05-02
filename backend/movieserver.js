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
//needs editing so watchlists are unique for each login
//each login will have their own collection
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
//adds a movie to the watchlist collection in MongoDB given the movie ID and information
//a movie should be added when clicked on a button for the frontend, sending the movie's ID
//the button will be on the movies' description page
app.post('/addToWatchlist', function(req, res) {
    //using a MongoDB collection for Watchlist:
    var uri = "mongodb://127.0.0.1:27017/";
    //connecting to database
    MongoClient.connect(uri, {useUnifiedTopology: true}, function(err, client) {
    if (err) {
      console.log("database connection POST error");
      return res.status(500).send({"message": "Error: Could not connect to database!"});
    }

    //connecting to Movie Theather database
    //contains a watchlist collection for each user
    var dbo = client.db("movieTheaterDB");
    
    //preventing duplicates:
    //query parameters for duplicate search (already in the watchlist)
    var query = {"_id": parseInt(req.body.movie_id)};
 
    //searching the database for matches using first_name and last_name
    dbo.collection("watchlist").find(query).toArray(function(err2, queryRes) {
      if (err2) {
        //something went wrong
        console.log("POST query error!");
        return res.status(500).send({"message": "POST Error: query error!"});
      }
      else if (queryRes.length > 0) {
        //matches were found
        console.log("This movie is already in the watchlist:", queryRes.length);
        client.close();
        return res.status(400).send({"message": "Error: Found " + queryRes.length + " matches!"});
      }
      else {
        //no matches were found, continues to create the document
        console.log("No duplicates found!");
        
        //POST given important information from the movie's description page
        var studentObj = {
          "_id": req.body.movie_id,
          "title": req.body.title,
          "image": req.body.image,
          "description": req.body.description,
          "IMDB_rating": req.body.rating
        }

        //inserting student record into the students collection
        dbo.collection("watchlist").insertOne(studentObj, function(err3) {
          if (err3) {
            //error message to the console and user client
            console.log("POST DB Add movie error");
            return res.status(400).send({"message": "POST Error: Could not Add movie to the watchlist!"});
          }
          //no errors, file is created
          console.log("POST: Movie added to the watchlist!");
          client.close();
          return res.status(200).send({"message": "Movie added to the watchlist!"});
        });
      }
    })
  });
})

//delete route method
//deletes a movie from the Watchlist collection in MongoDB given the movie ID
app.delete('/deleteFromWatchlist', function(req, res) {

    //local database uri
    var uri = "mongodb://127.0.0.1:27017/";
  
    //connecting to MongoDB
    MongoClient.connect(uri, { useUnifiedTopology: true }, function(err, client) {
      if (err) {
        console.log("database connection DELETE error!");
        return res.status(500).send({"message": "Error: Could not connect to the database!"});
      }
      else {
        //connecting to the Movie Theather database
        //contains a watchlist collection for each account
        var dbo = client.db("movieTheaterDB");
  
        //query parameters for matching IDs
        //the movie_id needs to be type casted as a number to find matches in the database
        var query = {"_id": parseInt(req.params.movie_id)};
  
        //deletes the first match with the given query parameters
        dbo.collection("watchlist").deleteOne(query,function(err2, delRes) {
          if (err2) {
            //error message to the console and client
            console.log("DELETE: deletion error!");
            return res.status(500).send({"message": "Error: Could not delete movie!"});
          }
          //returns an error if no corresponding movie is found
          else if (delRes.deletedCount === 0) {
            //movie not found
            console.log("Movie not found.");
            client.close();
            return res.status(400).send({"message": "Error: Movie not found!"});
          }
          else {
            //successfully deleted the movie from watchlist
            console.log("DELETE: Movie deleted from Watchlist!");
            client.close();
            return res.status(200).send({"message": "Movie deleted from Watchlist!"});
          }
        });
      }
    });
  }); //end of delete method

//Get Single Movie route method
//shows a single movie from the Watchlist collection in MongoDB given the movie ID
//This should re-render the page in react with the movie's description page
  app.get('/ShowMovieInfo', function(req, res) {
    //local database uri
    var uri = "mongodb://127.0.0.1:27017/";

    //connecting to MongoDB
    MongoClient.connect(uri, { useUnifiedTopology: true }, function(err, client) {
      if (err) {
        console.log("database connection ShowMovieInfo error!");
        return res.status(500).send({"message": "Error: Could not connect to the database!"});
      }
      else {
        //connecting to the database
        var dbo = client.db("movieTheaterDB");
  
        //query parameters for matching IDs
        //the movie_id needs to be type casted as a number to find matches in the database
        var query = {"_id": parseInt(req.params.movie_id)};
  
        //finds the first match with the given query parameters
        dbo.collection("watchlist").findOne(query, function(err2, findRes) {
          if (err2) {
            //error message to the console and client
            console.log("ShowMovieInfo: search error!");
            return res.status(500).send({"message": "Error: Database operation error!"});
          }
          if (findRes === null) {
            //movie not found
            console.log("Movie not found.");
            client.close();
            return res.status(400).send({"message": "Error: Movie not found!"});
          }
          else {
            //turns the found JSON document into a string to return
            var movieFound = JSON.stringify(findRes, null, 4);
            //successfully found the movie document, and returns it to the console and client
            console.log("ShowMovieInfo: Movie info:\n" + movieFound);
            client.close();
            return res.status(200).send(movieFound);
          }
        });
      }
    });
}); //end of get by id method

//List watchlist route method
//Returns all movies in the watchlist
app.get('/showWatchlist', function(req, res) {
    //local database uri
    var uri = "mongodb://127.0.0.1:27017/";

    //connecting to MongoDB
    MongoClient.connect(uri, { useUnifiedTopology: true }, function(err, client) {
      if (err) {
        console.log("database connection Watchlist (LIST) error!");
        return res.status(500).send({"message": "Error: Could not connect to the database!"});
      }
      else {
        //connecting to the database
        var dbo = client.db("movieTheaterDB");

        //Returns all movies in the watchlist (no query parameter)
        dbo.collection("students").find().toArray(function(err2, findRes) {
          if (err2) {
            //error message to the console and client
            console.log("Watchlist (LIST): search error!");
            return res.status(500).send({"message": "Error: Could not find movies!"});
          }
          else {
            //turns the found JSON document into a string to return
            if (findRes.length > 0) {
              var moviesFound = JSON.stringify(findRes, null, 4);
              //successfully found the student record, and returns it to the console and client
              console.log("Watchlist (LIST): Movies found:\n" + moviesFound);
              client.close();
              return res.status(200).send(moviesFound);
            }
            else {
              console.log("Watchlist (LIST): No movies in the database!");
              client.close();
              return res.status(400).send({"message": "No movies in the Watchlist!"});
            }
          }
        });
      }
    });
}); //end of GET (matches) route





//outputting the server address to the console
//server listens on port 5500
var server = app.listen(5500, function() {
    var port = server.address().port;
    console.log('port:', port);
    console.log('Server is running at http://localhost:' + port);
})