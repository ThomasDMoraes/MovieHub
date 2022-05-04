//This is the user's Watchlist page
//contains a list of movies added to their personal watchlist
//the movie information is retrieved from MongoDB

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


function Watchlist() {
    //setting ratingsResponse as a default object
    let [response, setResponse] = useState({"id": "",
                                            "title": "",
                                            "image": "",
                                            "description": ""});

    //authentication hook for authorization check
    const [user, loading, error] = useAuthState(auth);
    //used for redirection
    const navigate = useNavigate();
    //useEffect hook is called once the page is rendered to retrieve and show movie info
    //and displays the page's selected movie information
    useEffect(() => {
        setTimeout(() => {
            //using axios module to handle forms
            axios.get('http://localhost:5500/showWatchList')
            .then((response) => {
                //case success
                //outputs the server response message to the console
                console.log("response:", response.data);
                //and sets it as the response for the <div> on the website
                setResponse(response.data);
                //clearing input fields after successful submission
            })
            .catch((error) => {
                //case error
                //outputs the error message from the server to the console
                console.log("Movie not found (Axios error)");
            })
            .then(() => {
                //always executed
            })
        }, 1000);
    }, []);
 
    return (<>
        <h3>Movies in Watchlist:</h3>
        {/* Movie list */}
        {}



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
    </>);
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

 export default Watchlist;
