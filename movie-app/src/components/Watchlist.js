//This is the user's Watchlist page (incomplete)
//contains a list of movies added to their personal watchlist
//the movie information is retrieved from MongoDB

import { useState, useEffect, useContext} from 'react';
import axios from 'axios';
//component imports
import Movie from './Movie';
import LoadingDots from './LoadingDots';
//authentication imports
import { AccountContext } from './Account';
//React Bootstrap imports
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

//notification pop-up messages
import {NotificationManager} from 'react-notifications';

/**
 * Watchlist page component.
 * Retrieves and shows the user's watchlist.
 */
function Watchlist() {
    //initializing hooks
    let [response, setResponse] = useState();
    //authentication hook for authorization check
    const { getUser, getSession } = useContext(AccountContext);
    const [loading, setLoading] = useState(true);

    //useEffect hook is called once the page is rendered to retrieve and show movie info
    //and displays the page's selected movie information
    useEffect(() => {
        //Checks if the user is logged in
        //Retrieves the user's watchlist using an authentication token to be verified in the backend code
        if (getUser()) {
            getSession().then(async (sessionRes) => {
                await axios.get('http://localhost:5500/Watchlist?username='+getUser().username, {headers: {"authorization": sessionRes.accessToken.jwtToken}})
                .then((response) => {
                    //case success
                    console.log("response:", response);
                    //and sets it as the response for the <div> on the website
                    setResponse(response.data.watchlist);
                    
                })
                .catch((error) => {
                    //case error
                    console.log("error:", error);
                    NotificationManager.error(error.response.data.message)
                })
            })
            .catch((error) => {
                //case error
                console.log("Session error:", error);
                NotificationManager.error(error.response.data.message)
            })
            .finally(() => {
                //always executed
                setLoading(false);
            })
        }
        else {
            setLoading(false);
            NotificationManager.error("You are not logged in. Please log in to access your watchlist.");
        }
    }, []);
 
    //returns a movie list, with an option to click to view its MovieInfo page, and an option to delete from Watchlist
    //deleting from Watchlist would also need to re-render the page or change the 'response' object
    return (
        <Container>
            <Row>
            <h1 className="text-center title border-5 border-bottom mb-5 pb-4">Watchlist</h1>
            </Row>
            {/* Movie list */}
            {loading && <LoadingDots></LoadingDots>}
            {!loading && 
            <Row fluid>
                {response && <h1 className="mb-3 pb-2">Saved items ({response.length}):</h1>}
                {response && response.length > 0 && 
                    <Row sm="5">
                        {/*Mapping the response results array and returning a dynamic unordered list*/}
                        {response.map((movie) => {
                            console.log(movie);
                            return (                            
                            <Col>
                                <Movie
                                    key = {movie.imdbID}
                                    movie_id = {movie.imdbID}
                                    title = {movie.title}
                                    year = {movie.year}
                                    image = {movie.poster}
                                />
                            </Col>)
                        })}
                    </Row>
                }
                {response && response.length === 0 && <h5>Your watchlist is empty. Saved movies and series will show up here.</h5>}
            </Row>
            }
        </Container>);
}

 export default Watchlist;
