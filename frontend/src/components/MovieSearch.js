//This is the Movie Search page
//contains a search form to send to the backend (movieserver.js) and retrieve matches
//the form is handled as a GET request using Axios

//also need to integrate react-bootstrap for formatting
//may also combine with Title and Rating IMDB endpoints to get a better descriptions and ratings

import { useState } from 'react';
import axios from 'axios';
//importing router tags for MovieInfo pages
//useNavigation hook used for login button redirection
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import MovieInfo from './MovieInfo';
//authentication imports
import { auth } from './Login'
//needed to check on firebase Auth state
import { useAuthState } from "react-firebase-hooks/auth";


function MovieSearch() {
    //authentication hook for authorization check
    const [user, loading, error] = useAuthState(auth);
    //used for authorization redirection
    const navigate = useNavigate();

    //form inputs
    let [movieTitle, setMovieTitle] = useState("");
    //form response data
    //setting response as a default object
    let [response, setResponse] = useState({"id": "",
                                            "title": "",
                                            "image": "",
                                            "description": ""});
    //separate object for errors to display when they occur
    let [errorMessage, setErrorMessage] = useState({"message": ""});

    //sendForm function is triggered for submition of form data to the server, and returns an appropriate response
    let sendForm = (e) => {
        console.log("Movie Search test!!!");
        e.preventDefault();
        console.log("Search parameter:", movieTitle);

        //handling case where no movie title is given
        if (movieTitle === "") {
            console.log("Error: Please enter a movie title.");
            setErrorMessage({"message": "Error: Please enter a movie title and try again."});
            return;
        }

        //using axios module to handle forms
        axios.get('http://localhost:5500/search?title=' + movieTitle)
        .then((response) => {
            //case success
            //outputs the server response message to the console
            console.log("response:", response.data.results)
            //and sets it as the response for the <div> on the website
            setResponse(response.data.results);
            //clearing input fields after successful submission
            setMovieTitle("");
            //resetting error message
            if (typeof response != "nothing" && typeof response.data.results[0] != "undefined") {
                setErrorMessage({"message": ""});
            }
            //handling errors not caught by .catch (since they dont break the axios request for 404 and 500 errors)
            else {
                console.log("Axios Search Error");
                setErrorMessage({"message": "Error: Movie not found"});
            }
        })
        .catch((error) => {
            //case error
            //outputs the error message from the server to the console
            console.log("Axios Search Error.");
            //and sets it as the response for the <div> on the website
            setErrorMessage({"message": "Error: Movie not found."});
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
        <h3>Search for a movie:</h3>
        {/* Search form */}
        <form onSubmit={sendForm} target="res">
            <label htmlFor="movie_title">Search (Title): </label>
            {/* anonymous function used for onChange to update Title input box with user inputs by altering the state */}
            {/* the appropriate response is shown below the form on submission using && operators for responsiveness */}
            <input type="text" name="movie_title" size="20" id="movie_title" value={movieTitle}
             onChange={(e) => setMovieTitle(e.target.value)}/>
            <br /> <br />
            <button className="btn-primary" id="submit_btn" onClick={sendForm} >Submit</button>
        </form>
        <br />

        {/* Search results */}
        <div name="res" id="res"> <br/>
            {/* Errors for IMDB server errors or no results found*/}
            {/* response is null if there is a server error, or an empty array if no search matches are found*/}
            {errorMessage.message.length > 0 && (typeof response === "nothing" || typeof response[0] === "undefined") &&
            <p>{errorMessage.message}</p>}
            {/*unordered list appears when 'response' variable becomes the server response's results (successful)) */}
            {typeof response.id === "undefined" && typeof response[0] != "undefined" && <h4>Results:</h4>}
            {typeof response.id === "undefined" && typeof response[0] != "undefined" &&
            <ul className="list-group">
                {/*Mapping the response results array and returning a dynamic unordered list*/}
                {response.map((movie) => {
                    console.log(movie);
                    return (<Movie
                        key = {movie.id}
                        movie_id = {movie.id}
                        title = {movie.title}
                        image = {movie.image}
                        description = {movie.description}
                    />)
                })}
            </ul>
            }
        </div>
    </>)};
}


//Movie tag for the list mapping (needs bootstrap formatting)
//takes props from the mapping
function Movie(props) {
    return (
        <li className="list-group-item">
            <img src={props.image} alt="" height="200"/>
            <p>
                <strong>ID:</strong> {props.movie_id} <strong>Title:</strong> {props.title} <strong>Description:</strong> {props.description}
            </p>
            {/* Including a link to the corresponding MovieInfo page using a route, link, and ID prop */}
            <Link to = {'/MovieInfo/' + props.movie_id}>Visit</Link>
            <Routes>
                <Route path = {'/MovieInfo' + props.movie_id} element={<MovieInfo/>} />
            </Routes>
        </li>
    )
}

 export default MovieSearch;