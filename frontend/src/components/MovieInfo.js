//This is the Movie Info page
//contains deeper information about a selected movie
//movies can be added into the user's Watchlist from here

//notes: need to integrate react-bootstrap for formatting, and align everything properly.

//contains ID, fullTitle, plot, rating, genres


import { useState, useEffect } from 'react';
import axios from 'axios';
//useParams used to retrieve the current movieId in the URL
import {useParams} from 'react-router-dom';


function MovieInfo() {
    //setting ratingsResponse as a default object
    let [response, setResponse] = useState({"id": "",
                                            "title": "",
                                            "image": "",
                                            "description": ""});
    //takes the movie ID in the URL parameters
    let { movieId } = useParams();
    
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
    
     return (<>
        {/* outputting the movie information if successful */}
        {/* make the components into a grid for better layout */}
        {typeof response.fullTitle != "undefined" && response.fullTitle && 
        <>
            {/* movie image/poster */}
            <img src={response.image} height="400" />
            {/* movie title header */}
            <h2>Title: {response.fullTitle}</h2>
            {/* movie plot paragraph */}
            <p>Plot: {response.plot}</p>
            {/* movie rating */}
            <p>Rating: {response.imDbRating}</p>
            {/* showing movie ID */}
            <p>ID: {response.id}</p>
        </>}    

        {/* CREATE WATCHLIST ADD BUTTON */}


     </>)
     }


export default MovieInfo;