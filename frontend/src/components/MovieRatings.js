//This is the Movie Ratings page
//contains a search form to send to the backend (movieserver.js) for individual movies
//and also a list of top 250 rated movies when a button is pressed
//the form is handled as a GET request using Axios

//notes: still need to make the movie info pages, called when a movie is selected
//also need to integrate react-bootstrap for formatting

import { useState } from 'react'
import axios from 'axios';

function MovieRatings() {
    //form inputs
    let [movieId, setMovieId] = useState("");
    //form response data
    //setting response as an object in case a response object cant be given for the given ID
    let [response, setResponse] = useState({"id": "",
                                            "title": "",
                                            "image": "",
                                            "description": ""});

    //sendForm function is triggered for submition of form data to the server, and returns an appropriate response
    let sendForm = (e) => {
        console.log("Movie Rating test!!!");
        e.preventDefault();
        console.log("Search parameter:", movieId);

        //handling case where no movie title is given
        if (movieTitle === "") {
            console.log("Error: Please enter a movie ID.");
            setResponse({"message": "Error: Please enter a movie ID and try again."});
            return;
        }

        //using axios module to handle forms
        axios.get('http://localhost:5500/rating?movie_id=' + movieId)
        .then((response) => {
            //case success
            //outputs the server response message to the console
            console.log("response:", response.data.results)
            //and sets it as the response for the <div> on the website
            setResponse(response.data.results);
            //setColor("text-success");
            //clearing input fields after successful submission
            setMovieTitle("");
        })
        .catch((error) => {
            //case error
            //outputs the error message from the server to the console
            console.log(error.response.data.message);
            //and sets it as the response for the <div> on the website
            setResponse(error.response.data);
            //setColor("text-danger");
        })
        .then(() => {
            //always executed
        })
    };

    //anonymous function used for onChange to update Title input box with user inputs by altering the state
    //the appropriate response is shown below the form on submission using && operators for responsiveness
    return (<>
    <h3>Search for a movie:</h3>
    {/* Search form */}
    <form onSubmit={sendForm} target="res">
        <label htmlFor="movie_id">Search (Title): </label>
        <input type="text" name="movie_id" size="20" id="movie_id" value={movieId} onChange={(e) => setMovieId(e.target.value)}/>
        <br /> <br />
        <button className="btn-primary" id="submit_btn" onClick={sendForm} >Submit</button>
    </form>
    <br />

    {/* Search results */}
    <div name="res" id="res"> <br/>
        {/*unordered list appears when 'response' variable becomes the server response's results */}
        {typeof response.id === "undefined" && <h4>Results:</h4>}
        {typeof response.id === "undefined" &&
        <ul className="list-group">
            {/*Header row*/}
            {/*Mapping the response array and returning dynamic table rows and elements*/}
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


//Movie tag for the list mapping (needs bootstrap formatting)
//takes props from the mapping
function Movie(props) {
    return (
        <li className="list-group-item">
            <img src={props.image} height="200"/>
            <p>
                <strong>ID:</strong> {props.movie_id} <strong>Title:</strong> {props.title} <strong>Description:</strong> {props.description}
            </p>
        </li>
    )
}

 export default MovieRatings;