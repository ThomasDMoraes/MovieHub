//This is the Movie Info page
//contains deeper information about a selected movie
//contains ID, fullTitle, plot, rating, genres, ...
//movies can be added/removed from watchlists here

import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
//useParams used to retrieve the current movieId in the URL
import {useParams} from 'react-router-dom';
//component imports
import LoadingDots from './LoadingDots';
//authentication imports
import { AccountContext } from './Account';

//React Bootstrap imports
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';

//notification pop-up messages
import {NotificationManager} from 'react-notifications';

/**
 * Contains detailed information about the movie.
 * Checks if the movie is in the user's watchlist.
 * An add or remove button appears depending on the result. Only a message appears for offline users.
 */
function MovieInfo() {
    //initializing hooks
    let [response, setResponse] = useState({});
    //takes the movie ID in the URL parameters
    let { movieId } = useParams();
    //whether the movie/series is already in the watchlist
    const [isInWatchlist, setIsInWatchlist] = useState(false); 
    //basic approach, might be better to switch to an import for this instead of adding more load hooks
    const [loading1, setLoading1] = useState(true); //for movie info
    const [loading2, setLoading2] = useState(true); //for watchlist button
    //importing auth context functions
    const { getUser, getSession } = useContext(AccountContext);

    //useEffect hook is called once the page is rendered to retrieve and show movie info
    //and displays the page's selected movie information after all data is loaded from the requests
    useEffect(() => {
        //request 1: getting movie info
        axios.get('http://localhost:5500/movie?movie_id=' + movieId + "&plot=full")
        .then((res) => {
            console.log("response:", res.data);
            setResponse(res.data);
        })
        .catch((error) => {
            console.log("Movie not found. Error:", error);
        })
        .finally(() => {
            setLoading1(false);  
        })

        //request 2: decides which button will be rendered at the footer (add or remove) (usually takes longer than request 1)
        //checking if movie is already in the user's watchlist (if logged in)
        if (getUser()) {
            getSession().then(async (sessionRes) => {
                await axios.get("http://localhost:5500/isInWatchlist?username="+getUser().username+"&imdbID="+movieId, {
                    headers: {
                        "Authorization": sessionRes.accessToken.jwtToken
                    }
                })
                .then((res) => {
                    console.log("GET response:", res);
                    if (res.data.found) {
                        setIsInWatchlist(true);
                    }
                    else {
                        setIsInWatchlist(false);
                    }
                })
                .catch((err) => {
                    //some server or unexpected error
                    console.log("GET error:", err);
                    setIsInWatchlist(false);
                })
            })
            .catch((err) => {
                console.log("Session error:", err);
                NotificationManager.error("Session error");
            })
            .finally(() => {
                setLoading2(false);
            })
        }
        else {
            setLoading2(false);
        }
    }, []);

    /**
     * Adds the selected movie to user's watchlist.
     * Requires an authentication check, sending the access token to the backend for verification.
     * @param {string} username user's username
     * @param {object} item the item to add (movie)
     */
    const addToWatchlist = (username, item) => {
        setLoading2(true);
        getSession().then(async (sessionRes) => {
            await axios.post('http://localhost:5500/addToWatchlist', {
                "username": username,
                "item": {
                    "imdbID": item.imdbID, 
                    "title": item.Title,
                    "year": item.Year,
                    "rating": item.imdbRating,
                    "poster": item.Poster
                }
            }, {
                headers: {
                    "Authorization": sessionRes.accessToken.jwtToken
                }
            })
            .then((res) => {
                console.log("ADD response:", res);
                NotificationManager.success(res.data.message);
                setIsInWatchlist(true);
            })
            .catch((err) => {
                console.log("ADD error:", err);
                NotificationManager.error(err.response.data.message);
            })
        })
        .catch((err) => {
            console.log("Session error:", err);
            NotificationManager.error("Session error");
        })
        .finally(() => {
            setLoading2(false);
        })
    }

    /**
     * Removes the selected movie from user's watchlist.
     * Requires an authentication check, sending the access token to the backend for verification.
     * @param {string} username user's username
     * @param {string} imdbID movie's IMDB id
     */
    const removeFromWatchlist = (username, imdbID) => {
        setLoading2(true);
        getSession().then(async (sessionRes) => {
            await axios.delete("http://localhost:5500/removeFromWatchlist?username="+username+"&imdbID="+imdbID, {
                headers: {
                    "Authorization": sessionRes.accessToken.jwtToken
                }
            })
            .then((res) => {
                console.log("REMOVE response:", res);
                NotificationManager.success(res.data.message);
                setIsInWatchlist(false);
            })
            .catch((err) => {
                console.log("REMOVE error:", err);
                NotificationManager("Error removing this item");
            })
        })
        .catch((err) => {
            console.log("Session error:", err);
            NotificationManager.error("Session error");
        })
        .finally(() => {
            setLoading2(false);
        })
    }

    return (<>
        {loading1 && <LoadingDots></LoadingDots>}
        {/* outputting the movie information if successful */}
        {/* make the components into a grid for better layout */}
        {!loading1 &&
        <Container name="res" id="res">
            <Row className="justify-content-md-center center-text d-flex"> 
                <h1 className="text-center title border-5 border-bottom mb-5 pb-4">{response.Title} ({response.Year})</h1>
            </Row>
                <Card className="d-flex" bg="info" rounded fluid>
                    <Row>
                        <Col>
                            <Card.Img className="p-2" src={response.Poster} alt="" rounded style={{aspectRatio:"auto"}}/>   
                        </Col>
                        <Col>
                            <Card.Header><Card.Title>Plot</Card.Title></Card.Header>
                            <Card.Body>
                                <Card.Text>{response.Plot}</Card.Text>
                            </Card.Body>
                            <Card.Header><Card.Title>Cast</Card.Title></Card.Header>
                            <Card.Body>
                                <Card.Text ><strong>Actors:</strong> {response.Actors}</Card.Text>
                                <Card.Text ><strong>Directors:</strong> {response.Director}</Card.Text>
                                <Card.Text ><strong>Writers:</strong> {response.Writer}</Card.Text>
                            </Card.Body>
                            <Card.Header><Card.Title>Genres</Card.Title></Card.Header>
                            <Card.Body>
                                <Card.Text > {response.Genre}</Card.Text>
                            </Card.Body>
                        </Col>
                    </Row>
                    <Row>
                        <Col className="my-5 d-flex center-text">  
                            <Card.Title className="ps-5">Rated: {response.Rated}</Card.Title>
                            {/*Coloring based on ratings retrieved*/}
                            <Card.Title className="ps-5">Rating:
                                <span style={response.imdbRating < 5 ? {color:"red"} : response.imdbRating < 7 ? {color:"orange"} : {color:"green"}}> {response.imdbRating}</span>
                            </Card.Title>
                            <Card.Title className="ps-5">Duration: {response.Runtime}</Card.Title>            
                        </Col>
                    </Row>
                    <Card.Footer className="text-center p-4">
                        {/* Watchlist actions */}
                        {loading2 && <LoadingDots></LoadingDots>}
                        {!loading2 && !isInWatchlist && getUser() &&
                        <Button onClick={() => addToWatchlist(getUser().username, response)} style={{width:"50%"}}>Add to Watchlist</Button> }
                        {!loading2 && isInWatchlist && getUser() &&
                        <Button className="btn-danger" onClick={() => removeFromWatchlist(getUser().username, response.imdbID)} style={{width:"50%"}}>Remove Watchlist</Button> }
                        {!loading2 && !getUser() && 
                        <h5><i>Log in to add or remove from watchlist!</i></h5>}
                    </Card.Footer>
                </Card>     
        </Container>
        }    
    </>)
    }
    

export default MovieInfo;