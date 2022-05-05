//This is the Movie Info page
//contains deeper information about a selected movie
//contains ID, fullTitle, plot, rating, genres
//movies can be added into the user's Watchlist from here

//notes: need to integrate react-bootstrap for formatting, and align everything properly.

import { useState, useEffect } from 'react';
import axios from 'axios';
//useParams used to retrieve the current movieId in the URL
//useNavigation hook used for login button redirection
import {useParams, useNavigate} from 'react-router-dom';

//authentication imports
import { auth } from './Login'
//needed to check on firebase Auth state
import { useAuthState } from "react-firebase-hooks/auth";


function MovieInfo() {
    //setting ratingsResponse as a default object
    let [response, setResponse] = useState({"id": "",
                                            "title": "",
                                            "image": "",
                                            "description": ""});
    //takes the movie ID in the URL parameters
    let { movieId } = useParams();
    let [watchlistResponse, setWatchlistResponse] = useState({"message": ""});
    //authentication hook for authorization check
    const [user, loading, error] = useAuthState(auth);
    //used for redirection
    const navigate = useNavigate();

    //useEffect hook is called once the page is rendered to retrieve and show movie info
    //and displays the page's selected movie information
    useEffect(() => {
        setTimeout(() => {
            //using axios module to handle forms
            axios.get('http://localhost:5500/title?movie_id=' + movieId) //
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

    //sends the movie information as a data JSON object
    let addToWatchlist = (e) => {
        e.preventDefault();
        axios.post('http://localhost:5500/addToWatchlist', {
            "movie_id": response.id,
            "full_title": response.fullTitle,
            "image": response.image,
            "IMDB_rating": response.imDbRating
        })
        .then((watchlistResponse) => {
            //case success
            //outputs the server response message to the console
            console.log("response:", watchlistResponse.data.message)
            //and sets it as the watchlist response for view
            setWatchlistResponse(watchlistResponse.data);

        })
        .catch((watchlistError) => {
            //case error
            //outputs the error message from the server to the console
            console.log(watchlistError.response.data.message);
            //and sets it as the watchlist response for view
            setWatchlistResponse(watchlistError.response.data.message);
        })
        .then(() => {
            //always executed
        })

    }
    
    //renders a log in redirection button if user is not logged in after the authentication state is loaded
    if (!loading && !user) {
        return (<div>
            <h3>Please log in and try again.</h3>
            <button onClick={() => {navigate('.././Login')}}>Go to Login Page</button>
        </div>)
    }
    //user is comfirmed as logged in
    else if (!loading && user) {
        return ( <>
            {/* outputting the movie information if successful */}
            {/* make the components into a grid for better layout */}
            {typeof response.fullTitle != "undefined" && response.fullTitle && 
            <div name="res" id="res">
                {/* Watchlist ADD form button (send movie ID, fullTitle, rating, image) */}
                <form onSubmit={addToWatchlist} target="res">
                <button onClick={(e) => addToWatchlist}>Add to Watchlist</button>
                </form> <br/> <br/> <br/>
                {/* movie image/poster */}
                <img src={response.image} alt="" height="400" />
                {/* movie title header */}
                <h2>Title: {response.fullTitle}</h2>
                {/* movie plot paragraph */}
                <p>Plot: {response.plot}</p>
                {/* movie rating */}
                <p>Rating: {response.imDbRating}</p>
                {/* showing movie ID */}
                <p>ID: {response.id}</p>
            </div>}    
        </>)
        }
    }
    

export default MovieInfo;