//This is the Movie Ratings page
//contains a search form to send to the backend (movieserver.js) for individual movies
//and also a list of top 250 rated movies when a button is pressed
//the form is handled as a GET request using Axios

//notes: still need to make the movie info pages, called when a movie is selected
//also need to integrate react-bootstrap for formatting

import { useState } from 'react';
import axios from 'axios';
//importing router tags for MovieInfo pages
//useNavigation hook used for login button redirection
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import MovieInfo from './MovieInfo';
import { auth } from './Login'
//needed to check on firebase Auth state
import { useAuthState } from "react-firebase-hooks/auth";


function MovieRatings() {
    //authentication hook for authorization check
    const [user, loading, error] = useAuthState(auth);
    //used for authorization redirection
    const navigate = useNavigate();

    //form inputs
    let [movieId, setMovieId] = useState("");
    //form 1 (ratings search) response data
    //setting ratingsResponse as a default object
    let [ratingsResponse, setRatingsResponse] = useState({"id": "",
                                                          "title": "",
                                                          "image": "",
                                                          "description": ""});
    //form 2 (top 250) response data
    //setting ratingsResponse as a default object
    let [top250Response, setTop250Response] = useState({"id": "",
                                                        "title": "",
                                                        "image": "",
                                                        "description": ""});
    //separate object for errors to display when they occur
    let [errorMessage, setErrorMessage] = useState({"message": ""});    

    //placeholder for the movie ID, which is not retrieved with the ratings
    //used to link to the MovieRatings page
    let [idHolder, setIdHolder] = useState("");

    //sendRatingsForm function is triggered for submition of form data to the server, and returns an appropriate response
    //for the singular movie ratings search by ID
    let sendRatingsForm = (e) => {
        console.log("Movie Rating test!!!");
        e.preventDefault();
        console.log("Search parameter:", movieId);
        //used for MovieInfo page link
        setIdHolder(movieId);

        //handling case where no movie title is given
        if (movieId === "") {
            console.log("Error: Please enter a movie ID.");
            setErrorMessage({"message": "Error: Please enter a movie ID and try again."});
            return;
        }

        //using axios module to handle forms
        axios.get('http://localhost:5500/rating?movie_id=' + movieId)
        .then((response) => {
            //case success
            //outputs the server response message to the console
            console.log("response:", response.data);
            //and sets it as the response for the <div> on the website
            
            setRatingsResponse(response.data);
            //clearing input fields after successful submission
            setMovieId("");
            //resets error message if the request succesfully found the movie
            //checks the retrieved response, not our variable
            if (response.data.fullTitle) {
                console.log("Movie found.");
                setErrorMessage({"message": ""});
            }
            //handling errors not caught by .catch (since they dont break the axios request for 404 and 500 errors)
            else {
                console.log("Movie not found.");
                setErrorMessage({"message": "Movie not found."});
            }
        })
        .catch((error) => {
            //case error
            //outputs the error message from the server to the console
            console.log("Movie not found (Axios error)");
            //and sets it as the response for the <div> on the website
            setErrorMessage({"message": "Movie not found."});
        })
        .then(() => {
            //always executed
        })
    };

    //sendTop250Form function is triggered for submition on button click, and returns an appropriate response
    let sendTop250Form = (e) => {
        console.log("Top 250 Movies test!!!");
        e.preventDefault();

        //using axios module to handle forms
        axios.get('http://localhost:5500/top250')
        .then((response) => {
            //case success
            //outputs the server response message to the console
            console.log("response:", response.data);
            //and sets it as the response for the corresponding <div> on the website
            setTop250Response(response.data);
            //resets error message if the request succesfully found the movie
        })
        .catch((error) => {
            //case error
            //outputs the error message from the server to the console
            console.log("Top250 request failed");
            //and sets it as the response for the <div> on the website
            setErrorMessage({"message": "Top250 request failed."});
        })
        .then(() => {
            //always executed
        })
    };

    //renders a log in redirection button if user is not logged in after the authentication state is loaded
    if (!loading && !user) {
        return (<div>
            <h3>Please log in and try again.</h3>
            <button onClick={() => {navigate('.././Login')}}>Go to Login Page</button>

        </div>)
    }
    //user is comfirmed as logged in
    else if (!loading && user) {
        return (<>
        <h3>Search for a movie's Rating:</h3>
        {/* Search form */}
        <form onSubmit={sendRatingsForm} target="res1">
            <label htmlFor="movie_id">Search (ID): </label>
            {/*anonymous function used for onChange to update Title input box with user inputs by altering the state*/}
            {/*the appropriate response is shown below the form on submission using && operators for responsiveness*/}
            <input type="text" name="movie_id" size="20" id="movie_id" value={movieId} 
            onChange={(e) => setMovieId(e.target.value)}/>
            <br /> <br />
            <button className="btn-primary" id="submit_btn" onClick={sendRatingsForm} >Submit</button>
        </form>
        <br />

        {/* Search results */}
        <div name="res1" id="res1"> <br/>
            {/* Error message is shown if a movie is not found in the IMDB database */}
            {errorMessage.message.length > 0 && typeof ratingsResponse.id === "undefined" && !ratingsResponse.fullTitle &&
            <p>{errorMessage.message}</p>}
            {/*searched movie rating appears when 'response' variable becomes the server response's results */}
            {typeof ratingsResponse.id === "undefined" && ratingsResponse.fullTitle && <h4>Results:</h4>}
            {typeof ratingsResponse.id === "undefined" && ratingsResponse.fullTitle &&
            <>
                <p>Title:{ratingsResponse.fullTitle} <br/> IMDB Rating: {ratingsResponse.imDb}</p>
                {/* Including a link to the corresponding MovieInfo page using a route and link node */}
                <Link to = {'/MovieInfo/' + idHolder}>Visit</Link>
                <Routes>
                    <Route path = {'/MovieInfo' + idHolder} element={<MovieInfo/>} />
                </Routes>
            </>}
        </div>
        
        {/* Top 250 Movies section */}
        <h3>Top 250 Movies:</h3>
        {/* Top 250 form (just a button to send the request through the sendTop250Form function) */}
        <form onSubmit={sendTop250Form} target="res2">
            <button className="btn-primary" id="submit_btn" onClick={sendTop250Form} >Show</button>
        </form>
        <br />
        {/* Top 250 Movies results */}
        <div name="res2" id="res2">
            {typeof top250Response.items != "undefined" && <h4>Results:</h4>}
            {typeof top250Response.items != "undefined" &&
            <ul>
                {/*Mapping the response results array and returning a dynamic unordered list*/}
                {top250Response.items.map((movie) => {
                    console.log(movie);
                    return (<Movie
                        key = {movie.id}
                        movie_id = {movie.id}
                        movie_rank = {movie.rank}
                        title = {movie.fullTitle}
                        image = {movie.image}
                        rating = {movie.imDbRating}
                    />)
                })}
            </ul>}

        </div>
    </>)};
}


//Movie tag for the list mapping (needs bootstrap formatting)
//takes props from the mapping
//a grid format could be an improvement
function Movie(props) {
    return (
        <li className="list-group-item">
            <img src={props.image} alt="" height="200"/>
            <p>
            <strong>Rank: </strong> {props.movie_rank} <strong>ID:</strong> {props.movie_id} <strong>Title:</strong> {props.title} <strong>Rating:</strong> {props.rating}
            </p>
            {/* Including a link to the corresponding MovieInfo page using a route, link, and ID prop */}
            <Link to = {'/MovieInfo/' + props.movie_id}>Visit</Link>
            <Routes>
                <Route path = {'/MovieInfo' + props.movie_id} element={<MovieInfo/>} />
            </Routes>
        </li>
    )
}

 export default MovieRatings;