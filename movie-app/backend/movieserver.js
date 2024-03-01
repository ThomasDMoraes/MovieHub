//movieserver.js (backend NodeJS server)
//Utilizes the OMDB public API, MongoDB collections, and AWS Cognito
//to run: cd to movie-app dir , then enter 'node backend/movieserver.js'

//importing modules
const { CognitoJwtVerifier } = require("aws-jwt-verify");
const { CognitoIdentityProviderClient, AdminGetUserCommand, DeleteUserCommand, GetUserCommand } = require("@aws-sdk/client-cognito-identity-provider");
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const res = require('express/lib/response');
//const fetch = require('node-fetch'); //running version 2 since ESM wasn't working
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
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, authorization');
  //Allowing credential information
  res.setHeader('Access-Control-Allow-Credentials', true);

  next();
})

//Getting the API key from a JSON config file
//const apiKey = (JSON.parse(fs.readFileSync("backend/APIkey.json", "utf8"))).APIkey;
const apiKey = (JSON.parse(fs.readFileSync("backend/APIkey.json", "utf8"))).APIkey;
//Getting the MongoDB user and password from a JSON config file
const mongodbUser = (JSON.parse(fs.readFileSync("backend/mongodbCred.json", "utf8"))).username;
const mongodbPass = (JSON.parse(fs.readFileSync("backend/mongodbCred.json", "utf8"))).password;
const uri = "mongodb+srv://"+mongodbUser+":"+mongodbPass+"@moviehub-cluster.x5psaj0.mongodb.net/?retryWrites=true&w=majority";
//AWS Cognito userpool for users
const userPoolId =  (JSON.parse(fs.readFileSync("backend/cognitoUserPool.json", "utf8"))).userPoolId;
const userPoolClientId =  (JSON.parse(fs.readFileSync("backend/cognitoUserPool.json", "utf8"))).clientId;


//Functions (used inside API endpoints) ---------------------

/**
 * Called inside functions requiring partial authentication checks.
 * Checks if the given username is in the users' userpool.
 * NOTE: This function should be modified to take a userpool object if more userpools are being used in the future.
 * @param {string} username user's username to check
 * @returns {boolean} boolean value
 */
async function isUser(username) {
  try {
    const cognitoClient = new CognitoIdentityProviderClient();
    const input = { // AdminGetUserRequest
      UserPoolId: userPoolId, // required
      Username: username, // required
    };
    const command = new AdminGetUserCommand(input);
    const response = await cognitoClient.send(command);
    console.log("Auth response:", response);
    return true;
  }
  catch {
    return false;
  }
}

/**
 * Called inside functions requiring authentication checks.
 * Checks if the given AWS Cognito access token is valid.
 * NOTE: MIGHT BE ABLE TO USE A TOKEN FROM OTHER ACCOUNTS??? CHECK THE USER!
 * @param {string} username user's username to check against token
 * @param {string} token user's JWT Access Token from Cognito
 * @returns {boolean} boolean value
 */
async function isLoggedIn(username, token) {
  //Verifying tokens
  try {
    //validating token and getting its user object
    const client = new CognitoIdentityProviderClient();
    const input = { 
      AccessToken: token
    };
    const command = new GetUserCommand(input);
    const response = await client.send(command);
    //checking if the token belongs to the correct user
    return (response.Username === username)
  }
  catch(err)  {
    console.log("verification error:", err);
    return false;
  }
}

/**
 * Called inside our API endpoints to search and retrieve a list of movies.
 * Utilizes the OMDB search API.
 * @param {string} title Title to search for
 * @param {string, int} page selected page for search
 * @returns {object} returnObj containing status code and data (if successful), or an error (if not)
 */
 async function searchMovies(title, page) {
    //URL of OMDB endpoint for external GET request
    let url = "http://www.omdbapi.com/?s=" + title + "&page="+ page + "&apikey=" + apiKey;
    let returnObj = {};
    //fetching data from the OMDB database
    await fetch(url)
      //converting retrieved text data to json
      .then(res => res.json())
        //sending back response with retrieved JSON object
        .then((data) => {
            console.log("MovieSearch FETCH successful!");
            if (typeof data.Error !== "undefined") {
              returnObj.statusCode = 400;
              returnObj.data = data;
            }
            else {
              returnObj.statusCode = 200;
              returnObj.data = data;
            }
        })
        .catch((err) => {
            console.log("MovieSearch FETCH Error!");
            returnObj.statusCode = 500;
            returnObj.data = {"Error": "Search server error"};
        })
        return returnObj;
}

/**
 * Called inside our API endpoints to find and retrieve a specific movie.
 * Utilizes the OMDB search API.
 * @param {string} movie_id the movie's unique IMDB ID
 * @returns {object} A single movie with the corresponding movie_id
 */
async function getMovie(movie_id, plot) {
  //movie_id is the user search parameter
  let url = "http://www.omdbapi.com/?i=" + movie_id + "&plot="+plot+"&apikey=" + apiKey;
  let returnObj = {};
  
  //fetching informational data for the movie corresponding movie_id from the OMDB database 
  await fetch(url)
    //converting retrieved text data to json
    .then(res => res.json())
    //sending back response with retrieved JSON object
    .then((data) => {
        console.log("ID FETCH successful!");
        returnObj.statusCode = 200;
        returnObj.data = data;
    })
    .catch(err => {
        console.log("ID FETCH Error!");
        returnObj = err;
        returnObj.statusCode = 500;
        
    });
    return returnObj;
}

/**
 * Creates a user watchlist on the MongoDB database.
 * The username should be checked against the Cognito userpool beforehand.
 * @param {string} username the given username to create create the watchlist with.
 * @param {MongoClient} dbo the MongoDB database client to operate on. The client should be closed outside the function.
 * @returns {object} an object containing an appropriate statusCode and message attributes
 */
async function createWatchlist(username, dbo) {
  let returnObj = {};

  //watchlist object to insert
  let watchlistObj = {
    "username": username,
    "list": [],
    "length": 0
  }
  //checking if there is an existing watchlist already (would create a duplicate otherwise)
  await dbo.collection("Watchlists").findOne({"username": username}).then(async (data) => {
      //found a match
      if (data) {
        console.log("Error: This user already has a watchlist.");
        returnObj.statusCode = 400;
        returnObj.message = "Error: This user already has a watchlist.";
      }
      else {  
        console.log("No existing watchlist for user=" +username+" was found. Creating watchlist.");
        //creating watchlist
        await dbo.collection("Watchlists").insertOne(watchlistObj).then(() => {
          console.log("Watchlist created for user: ", username);
          returnObj.statusCode = 200;
          returnObj.message = "Watchlist created for user: "+ username;
        }).catch((err) => {
            //error message to the console and user client
            console.log("Error creating watchlist:", err);
            returnObj.statusCode = 500;
            returnObj.message = "Error: Could not create user watchlist.";
        });
      }
  }).catch((err) => {
      //error message to the console and user client
      console.log("Server error searching for watchlist:", err);
      returnObj.statusCode = 500;
      returnObj.message = "Server error:", err;
  });

  return returnObj;
}


/**
 * Adds a movie (item) to the user's watchlist.
 * Also increments the movie's saved counter.
 * If there is no existing record of the movie, one is created.
 * Uses transactions.
 * @param {string} username corresponding watchlist username
 * @param {object} item the movie to be added
 * @returns {object} a response object with statusCode and message
 */
async function addToWatchlist(username, item) {
  //Initializing database variables and connections
  var client = new MongoClient(uri);
  var dbo = client.db("MovieHub-db");
  //required for transactions
  const session = client.startSession(); 

  //return object
  let returnObj = {};
  //POST given important information
  let query = { username: username };
  let update = {
    $addToSet: {list: item.imdbID}, //adds item to list array if not present
    $inc: {length: 1} //increments length by 1
  }; 
  //find movie
  let movieQuery = {
    imdbID: item.imdbID
  }
  //update counters
  let movieUpdate = {
    $inc: {savedCount: 1}
  };
  //to insert
  let movieObj = item;
  movieObj.savedCount = 1;

  try {
    await session.withTransaction(async () => {
      //tries to update existing movie record
      await dbo.collection("Movies").findOneAndUpdate(movieQuery, movieUpdate, {session}).then((data) => {
        if (data.lastErrorObject.updatedExisting) {
          console.log("movie record found:", data);
        }
        else {
          console.log("movie record not found.");
          //creates a new movie record instead
          dbo.collection("Movies").insertOne(movieObj, {session})
          .then(() => {console.log("created movie record.");})
          .catch((err) => {console.log("Could not create movie record. Err:", err);})
        }
    })})
    //adding movie to user's watchlist
    await dbo.collection("Watchlists").updateOne(query, update, {session}).then(() => {
      console.log("Added to "+username+"'s watchlist:", item);
    }).catch((err) => {
      console.log("Error finding movie record:", err);
    })
    returnObj.statusCode = 200;
    returnObj.message = "Added movie to watchlist!";
  }
  catch (err) {
    console.log("ADD endpoint error:", err);
    returnObj.statusCode = 500;
    returnObj.message = "Error: Could not add to watchlist";
  }
  finally {
    session.endSession();
    client.close();
    return returnObj;
  }
}

/**
 * Removes a movie from the user's watchlist.
 * Also updates the corresponding movie's record.
 * Removes the movie record if necessary.
 * Uses transactions.
 * @param {string} username the user's username for the watchlist
 * @param {string} imdbID the movie's id used for searching
 * @returns {object} a response object with statusCode and message
 */
async function removeFromWatchlist(username, imdbID) {
  //Initializing database variables and connections
  var client = new MongoClient(uri);
  var dbo = client.db("MovieHub-db");
  //required for transactions
  const session = client.startSession(); 
  
  let returnObj = {};

  //search and removal queries
  let query = { username : username };
  let movieQuery = {
    imdbID: imdbID
  }
  let movieUpdate = {
    $inc: {savedCount: -1}
  }
  let remover = { $pull: {list : imdbID }, $inc: {length: -1}};

  await session.withTransaction(async () => {
    //calls to update the user's watchlist
    await dbo.collection("Watchlists").updateOne(query, remover, {session})
    .then(() => {console.log("removed "+  imdbID +" from "+username+"'s watchlist."); //record is updated
    })
    .catch((err) => {console.log("could not remove movie from user's watchlist. Err: " + err)});

    //separate call to update the movie record
    await dbo.collection("Movies").findOneAndUpdate(movieQuery, movieUpdate, {session})
    .then((data) => {
      //making sure the object was found and decremented before continuing
      if (data.lastErrorObject.updatedExisting) { 
        //the count is from BEFORE our decrementation.
        if (data.value.savedCount <= 1) { 
          //removes movie record afterwards if needed
          dbo.collection("Movies").deleteOne(movieQuery, {session})
          .then(() => {
            console.log("Movie record removed from database.")
            //successful return values
            returnObj.statusCode = 200;
            returnObj.message = "Removed movie from watchlist!";
          })
          .catch((err) => {
            //In case an error occurs removing the record
            console.log("Movie record could not be removed. Err: " + err)
            returnObj.statusCode = 500;
            returnObj.message = "Unexpected server error.";
          });
        }
        else {
          //Does not need to delete the record, so it's done.
          returnObj.statusCode = 200;
          returnObj.message = "Removed movie from watchlist!";
        }
      }
      else {
        //Error: no matches found to remove
        console.log("Could not find the record.");
        returnObj.statusCode = 400;
        returnObj.message = "movie record was not found."
      }
    })
    .catch(() => {
      //In case an error occurs finding and updating the record
      console.log("Unexpected server error: " + err)
      returnObj.statusCode = 500;
      returnObj.message = "Unexpected server error.";
    })
  });
  //cleaning up and returning
  session.endSession();
  client.close();
  return returnObj;
}

/**
 * Checks if the given movie is in the user's watchlist.
 * @param {string} username the user's username for the watchlist
 * @param {string} imdbID the movie's id used for searching
 * @returns {object} a response object with statusCode, message, and found status
 */
async function isInWatchlist(username, imdbID) {
  //MongoDB variables
  var client = new MongoClient(uri);
  var dbo = client.db("MovieHub-db");

  let returnObj = {};

  //searches for records with the given username and imdbID in the watchlist
  let query = {$and: [{username: username}, {list: imdbID}]};

  //finds a watchlist with the given movie/series
  await dbo.collection("Watchlists").findOne(query)
    .then((data) => {
      console.log("DATA:", data)
      //found a match
      if (data) {
        console.log("movie/series is on the watchlist!");
        returnObj.statusCode = 200;
        returnObj.message = "the movie or series is on the watchlist!";
        returnObj.found = true;
      }
      else {
        //no matches
        console.log("movie/series is not on the watchlist!");
        returnObj.statusCode = 400;
        returnObj.message = "the movie or series is not on the watchlist!";
        returnObj.found = false;
      }
  }).catch((err) => {
      //some server or unexpected error
      console.log("Server error searching for a match in the watchlist:", err);
      returnObj.statusCode = 500;
      returnObj.message = "Server error: " + err;
      returnObj.found = false;
  });
  client.close();
  return returnObj;
}

/**
 * Retrieves the user's watchlist in MongoDB.
 * @param {string} username the user's username for the watchlist
 * @returns {object} a response object with statusCode and watchlist array (success) or message (error)
 */
async function watchlist(username) {
  //MongoDB variables
  var client = new MongoClient(uri);
  var dbo = client.db("MovieHub-db");

  let returnObj = {};

  //POST given important information from the movie's description page
  let query = { username: username };
  //finds a watchlist with the given movie/series
  await dbo.collection("Watchlists").findOne(query)
    .then(async (data) => {
      //found a match
      if (data) {
        console.log("Watchlist found for user="+username+":\n" , data);
        //needs to use the retrieved list to get and return all the movie records!
        let watchlist = await dbo.collection("Movies").find({imdbID: {$in: data.list}}).toArray();
        console.log("retrieved watchlist:" , watchlist);
        client.close();
        returnObj.statusCode = 200;
        returnObj.watchlist = watchlist;
        //return res.status(200).send(watchlist);
      }
      else {  
        console.log("Error: Watchlist not found.");
        client.close();
        returnObj.statusCode = 400;
        returnObj.message = "Watchlist not found."
        //return res.status(400).send({"message": "Watchlist not found."});
      }
  }).catch((err) => {
      //error message to the console and user client
      console.log("Server error searching for watchlist:", err);
      client.close();
      returnObj.statusCode = 500;
      returnObj.message = "Server error:", err;
      //return res.status(500).send({"message": "Server error: " + err});
  });
  return returnObj;
}

/**
 * Retrieves the top n most saved movie records stored in MongoDB.
 * @param {int} n determines the length to fetch
 * @returns {object} a response object with statusCode and a sorted array of movies (success) or message (error)
 */
async function mostSaved(n) {
  //MongoDB variables
  var client = new MongoClient(uri);
  var dbo = client.db("MovieHub-db");

  let query = {};
  let returnObj = {};

  try {
    //retrieving a descending sorted cursor array from the database
    let movieList = await dbo.collection("Movies").find(query).sort({savedCount: -1}).toArray();
    movieList.splice(n, movieList.length - n); //removing unwanted movies (not in the top n)
    console.log("retrieved movies:", movieList);
    client.close();
    returnObj.statusCode = 200;
    returnObj.movieList = movieList;
  }
  catch (err) {
    console.log("Server error retrieving most saved list:", err);
    client.close();
    returnObj.statusCode = 500;
    returnObj.movieList = message = "Server error:" + err;
  }
  finally {
    return returnObj;
  }
}


/**
 * Deletes the user's watchlist, updates/removes movie records, and deletes the Cognito user.
 * Uses transactions.
 * @param {string} username user's username 
 * @param {string} token user's JWT Access Token string
 * @returns {object} a response object with statusCode and message
 */
async function deleteAccount(username, token) {
  //MongoDB variables
  var client = new MongoClient(uri);
  var dbo = client.db("MovieHub-db");
  const session = client.startSession();

  //getting user's watchlist 
  let list = await watchlist(username);
  console.log("list:", list);
  //making a separate array for just the movie ID references
  let idList = []; 
  list.watchlist.forEach((element) => {idList.push(element.imdbID)});
  console.log("idList:", idList);

  //queries
  let moviesQuery = {imdbID: {$in : idList}};
  let moviesUpdate = {$inc: {savedCount: -1}}
  let moviesRemovalQuery = {savedCount: 0}
  let deleteQuery = {username: username}

  let returnObj = {};

  //starting MongoDB operations in a transaction
  await session.withTransaction(async () => {
    await dbo.collection("Movies").updateMany(moviesQuery, moviesUpdate)
    .then(async (data) => {
      //successfully updated all documents
      console.log("update data:", data);
      if (data.modifiedCount === idList.length) {
        console.log("All movie records updated.");
        //removing movie records that now have a savedCount of 0
        await dbo.collection("Movies").deleteMany(moviesRemovalQuery)
        .then((data) => {
          console.log("deleted "+ data.deletedCount + " movie records!");
        })
        .catch((err) => {
          console.log("Unexpected error deleting movie records:", err);
          returnObj.statusCode = 500;
          returnObj.message = "Unexpected error deleting movie records:", err;
        })
        //removing user's watchlist record next
        await dbo.collection("Watchlists").deleteOne(deleteQuery)
        .then((data) => {
          if (data.deletedCount === 1) {
            //Successfully completed all operations
            console.log("Successfully deleted watchlist record for user="+username);
            returnObj.statusCode = 200;
            returnObj.message = "Successfully deleted watchlist record for user="+username;
          }
          else {
            console.log("Failed to delete watchlist record for user="+username);
            returnObj.statusCode = 400;
            returnObj.message = "Failed to delete watchlist record for user="+username;
          }
        })
        .catch((err) => {
          //Error: failed to delete watchlist record
          console.log("Server error deleting watchlist:", err);
          returnObj.statusCode = 500;
          returnObj.message = "Server error deleting watchlist:", err;
        })
      }
      else {
        //Error: partial or no updates made
        console.log("Error: Not all movie records updated. Aborting transaction...");
        //throw "Error: Not all movie records updated. Aborting transaction...";
        returnObj.statusCode = 500;
        returnObj.message = "Error: Not all movie records updated. Aborting transaction...";
      }
    })
    .catch((err) => {
      console.log("Error updating movie records:", err);
      returnObj.statusCode = 500;
      returnObj.message = "Error updating movie records:", err;
    })
    //delete cognito user
    if (returnObj.statusCode === 200) {
      //AWS Cognito variables
      const cognitoClient = new CognitoIdentityProviderClient();
      const cognitoInput = {AccessToken: token};
      const cognitoCommand = new DeleteUserCommand(cognitoInput);
      await cognitoClient.send(cognitoCommand).then((data) => {
        console.log("Deleted Cognito user. Response data:", data);
      })
      .catch((err) => {
        console.log("Error deleting Cognito user:", err)
        session.abortTransaction();
      });
    }
  })
  //finishing up
  session.endSession();
  client.close();
  console.log("final return obj:", returnObj);
  return returnObj;
}



//OMDB endpoints: ----------------------------------------------------


/**
 * Search endpoint.
 * Utilizes the OMDB API to retrieve an array of results.
 * No auth required.
 */
app.get('/search', async function(req, res) {
  console.log("search endpoint:");

  //trying a new method.
  let moviesResult = await searchMovies(req.query.title, req.query.page);
  console.log("Result:", moviesResult);
  return res.status(moviesResult.statusCode).send(moviesResult.data);
})

//Movie (ID) OMDB API (no auth required)
app.get('/movie', async function(req, res) {
  console.log("movie endpoint:");

  console.log("ID received:", req.query.movie_id)
  console.log("plot received:", req.query.plot)
  //calling search function to retrieve results
  let movieResult = await getMovie(req.query.movie_id, req.query.plot);
  console.log("Result:", movieResult);
  return res.status(movieResult.statusCode).send(movieResult.data);
})



//MongoDB endpoints: ------------------


/**
 * Create Watchlist endpoint.
 * Creates a watchlist record for a user in MongoDB.
 * Watchlists are represented as arrays of movie IDs.
 * Some Auth checks required.
 */
app.post("/createWatchlist", async function(req, res) {
  console.log("createWatchlist endpoint:");
  console.log("req.body.username:", req.body.username);
  //checking if the newly registered user is indeed in the user pool before creating a watchlist
  if (!isUser(req.body.username)) {
    return res.status(400).send({"message": "Error: User unrecognized."});
  }

  //MongoDB variables
  var client = new MongoClient(uri);
  var dbo = client.db("MovieHub-db");

  //creating the watchlist
  //note: we need to pass the MongoDB client, and close it afterwards 
  let creationResult = await createWatchlist(req.body.username, dbo);
  client.close();
  return res.status(creationResult.statusCode).send(creationResult);
});


/**
 * Add To Watchlist endpoint.
 * inserts a movie/series into the user's watchlist.
 * Uses transactions.
 * Auth required.
 */
app.post("/addToWatchlist", async function(req, res) {
  console.log("addToWatchlist endpoint:");
  console.log("req.body.username:", req.body.username); //username used to find watchlist record
  console.log("req.body.item:", req.body.item); //item being added to list

  //Verifying tokens
  if (!isLoggedIn(req.body.username, req.headers.authorization)) {
    return res.status(400).send({"message": "Token validation error"});
  }

  //INSERT FUNCTION HERE!
  let addResult = await addToWatchlist(req.body.username, req.body.item);
  console.log("ADD RESULT:", addResult);
  return res.status(addResult.statusCode).send(addResult);
});


/**
 * Remove From Watchlist endpoint.
 * removes a movie/series from the user's watchlist.
 * Uses transactions.
 * Auth required.
 */
app.delete("/removeFromWatchlist", async function(req, res) {
  console.log("removeFromWatchlist endpoint:");
  console.log("req.query.username:", req.query.username); // key used for finding record
  console.log("req.query.imdbID:", req.query.imdbID); // key used for finding movie/series

  //Verifying tokens
  if (!isLoggedIn(req.query.username, req.headers.authorization)) {
    return res.status(400).send({"message": "Token validation error"});
  }

  //REMOVE FUNCTION HERE!
  let removeResult = await removeFromWatchlist(req.query.username, req.query.imdbID);
  console.log("REMOVE RESULT:", removeResult);
  return res.status(removeResult.statusCode).send(removeResult);
});


//checks if a movie/series is in the user's watchlist (Auth required)
app.get("/isInWatchlist" , async function(req, res) {
  console.log("isInWatchlist endpoint:");
  console.log("req.query.username:", req.query.username); // key used for finding record
  console.log("req.query.imdbID:", req.query.imdbID); // key used for finding movie/series
  //Verifying tokens
  if (!isLoggedIn(req.query.username, req.headers.authorization)) {
    return res.status(400).send({"message": "Token validation error"});
  }

  //fetching results
  let getResult = await isInWatchlist(req.query.username, req.query.imdbID);
  console.log("GET RESULT:", getResult);
  return res.status(getResult.statusCode).send(getResult);
});


/**
 * Watchlist endpoint.
 * Gets user's watchlist.
 * Auth required.
 */
app.get("/Watchlist" , async function(req, res) {
  console.log("Watchlist endpoint:");
  console.log("req.query.username:", req.query.username); // key used for finding watchlist record
  //Verifying tokens
  if (!isLoggedIn(req.query.username, req.headers.authorization)) {
    return res.status(400).send({"message": "Token validation error"});
  }

  //retrieving watchlist
  let watchlistObj = await watchlist(req.query.username);
  console.log("Watchlist object:", watchlistObj);
  return res.status(watchlistObj.statusCode).send(watchlistObj);
});


/**
 * Most Saved endpoint.
 * retrieves the sorted top n most saved media by users
 * No auth required.
 */
app.get("/MostSaved", async function(req, res) {
  console.log("MostSaved endpoint:");
  console.log("req.query.n:", req.query.n); // key used for finding watchlist record

  //retrieving the list
  let mostSavedList = await mostSaved(req.query.n);
  console.log("Watchlist object:", mostSavedList);
  return res.status(mostSavedList.statusCode).send(mostSavedList);
});


/**
 * Delete Account endpoint.
 * deletes the corresponding user's account.
 * Auth required.
 */
app.delete("/DeleteAccount", async function(req,res) {
  console.log("Delete Account endpoint:");
  console.log("req.query.username:", req.query.username); // key used for finding watchlist record
  //Verifying tokens
  if (!isLoggedIn(req.query.username, req.headers.authorization)) {
    return res.status(400).send({"message": "Token validation error"});
  }

  //Deleting watchlist and AWS Cognito account
  let deleteResult = await deleteAccount(req.query.username, req.headers.authorization);
  console.log("deleteResult object:", deleteResult);
  return res.status(deleteResult.statusCode).send(deleteResult);
});

//outputting the server address to the console
//server listens on port 5500
var server = app.listen(5500, function() {
    var port = server.address().port;
    console.log('port:', port);
    console.log('Server is running at http://localhost:' + port);
});
