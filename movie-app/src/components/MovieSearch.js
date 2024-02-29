//This is the Movie Search page
//contains a search form to send to the backend (movieserver.js) and retrieve matches
//the form is handled as a GET request using Axios

import { useState, useEffect } from 'react';
import axios from 'axios';

//component imports
import LoadingDots from './LoadingDots';
import Movie from './Movie';

//React Bootstrap imports
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import search_icon from '../icons/search_icon.png';

//notification pop-up messages
import {NotificationManager} from 'react-notifications';


function MovieSearch() {
    //initializing hooks
    let [movieTitle, setMovieTitle] = useState("");
    let [response, setResponse] = useState({});
    const [currentPage, setCurrentPage] = useState(parseInt(localStorage.getItem("page"))); //used to be 1
    const [loading, setLoading] = useState(false);
    
    /**
     * sendForm function is triggered for submition of form data to the server, and returns an appropriate response
     * @param {Event} e react event
     * @param {String} title movie title to search
     */
    let sendForm = (e, title) => {
        console.log("Movie Search test!!!");
        if (e) {
            e.preventDefault();
        }
        setLoading(true);
        console.log("Search parameter:", title);

        //storing current page value, used later for search checks
        let searchPage = currentPage;

        //handling case where no movie title is given
        if (title === "") {
            console.log("Error: Please enter a title.");
            NotificationManager.warning("Error: Please enter a title and try again.");
            setLoading(false);
            return;
        }
        else if (title !== localStorage.getItem("title")) {
            searchPage = 1; //new search, so reset to page 1
        }

        //using axios module to call our APIs
        axios.get('http://localhost:5500/search?title=' + title + "&page=" + searchPage)
        .then((res) => {
            //success
            console.log("res:", res);
            //updating variables
            setResponse(res.data);
            localStorage.setItem("title", title);
            localStorage.setItem("page", searchPage);
            setCurrentPage(searchPage);
        })
        .catch((error) => {
            //error
            console.log("Axios Search Error.");
            console.log("Error:", error);
            NotificationManager.warning("Error: "+ error.response.data.Error); //may need additional debugging, sometimes breaks?
        })
        .finally(() => {
            //clearing input fields after successful submission
            setMovieTitle("");
            setLoading(false);
        })
    };

    //triggers whenever the page number is changed for the search, retrieving new results.
    useEffect(() => {
        //stops the form from being sent when page first renders, sends it otherwise
        if (currentPage !== 1 || response.totalResults) { 
            console.log("response:", response);
            sendForm(null, localStorage.getItem("title"));
        }
        //queries for the last search results when the page first loads, using local storage. Allows for smoother user navigation.
        else if (!response.totalResults) {
            setCurrentPage(parseInt(localStorage.getItem("page")));
            sendForm(null, localStorage.getItem("title"));
        }
    }, [currentPage])

    /**
     * triggered when a page button is pressed to switch to the corresponding page
     * @param {int} pageNum the selected page number to switch to
     */
    let changePage = (pageNum) => {
        if (pageNum === "<" && currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
        else if (pageNum === ">" && currentPage < Math.ceil(response.totalResults / 10)) {
            setCurrentPage(currentPage + 1);
        }
        else {
            setCurrentPage(pageNum);
        }
    }


    return (
    <Container>
        {/* Search form */}
        <Row className="justify-content-md-center center-text">
            <Form className="bg-info rounded p-2" onSubmit={(e) => sendForm(e, movieTitle)}>
                <Form.Group className="mx-3">
                    <Form.Label className="center-text text-white"><h1>Search for movies</h1></Form.Label>
                    <Container className="d-sm-flex">
                        <Form.Control type="text" placeholder="Enter a title or keyword" value={movieTitle} onChange={(e) => setMovieTitle(e.target.value)}></Form.Control>
                        <Button type="submit" className="btn-info border border-5 ms-1" id="submit_btn">
                            <Image src={search_icon} width="30px"></Image>
                        </Button>
                    </Container>
                    <Form.Text className="text-muted ms-1"><i>Note: The OMDB API does not retrieve results when there are too many matches (example: entering 'ab')</i></Form.Text>
                </Form.Group>
            </Form>
        </Row>
        <br/>
        {/* Search results */}
        <Row name="res" id="res" fluid>
            {/*unordered list appears when 'response' variable becomes the server response's results (successful)) */}
            {typeof response.Search !== "undefined" && <h1 className="mb-3 pb-2">Results:</h1>}
            {typeof response.Search !== "undefined" &&
            <div>
                <Row sm="5">
                    {/*Mapping the response results array and returning a dynamic unordered list*/}
                    {response.Search.map((movie) => {
                        //console.log(movie);
                            return (
                                <Col>
                                    <Movie
                                        key = {movie.imdbID}
                                        movie_id = {movie.imdbID}
                                        title = {movie.Title}
                                        year = {movie.Year}
                                        image = {movie.Poster}
                                    />
                                </Col>
                            )
                        }
                    )}
                </Row>
                {/*Page number buttons*/ }
                <div className="d-flex center-text mb-3">
                    {currentPage !== 1 && <Button className="btn-info mx-1 p-1 circular faded" onClick={() => changePage("<")}>{"<"}</Button>}
                    {currentPage > 3 && <Button className="btn-info mx-1 p-1 circular faded" onClick={() => changePage(1)}>1..</Button>}
                    {currentPage - 2 > 0 && <Button className="btn-info mx-1 p-1 circular faded" onClick={() => changePage(currentPage - 2)}>{currentPage - 2}</Button>}
                    {currentPage - 1 > 0 && <Button className="btn-info mx-1 p-1 circular faded" onClick={() => changePage(currentPage - 1)}>{currentPage - 1}</Button>}
                    {<Button className="btn-primary mx-1 p-1 circular">{currentPage}</Button>}
                    {currentPage < Math.ceil(response.totalResults / 10) && <Button className="btn-info mx-1 p-1 circular faded" onClick={() => changePage(currentPage + 1)}>{currentPage + 1}</Button>}
                    {currentPage < Math.ceil(response.totalResults / 10) - 1 && <Button className="btn-info mx-1 p-1 circular faded" onClick={() => changePage(currentPage + 2)}>{currentPage + 2}</Button>}
                    {currentPage < Math.ceil(response.totalResults / 10) - 2 && <Button className="btn-info mx-1 p-1 circular faded" onClick={() => changePage(Math.ceil(response.totalResults / 10))}>..{Math.ceil(response.totalResults / 10)}</Button>}
                    {currentPage !== Math.ceil(response.totalResults / 10) && <Button className="btn-info mx-1 p-1 circular faded" rounded onClick={() => changePage(">")}>{">"}</Button>}
                </div>
            </div>
            }
            {loading && <LoadingDots></LoadingDots>}
        </Row>
    </Container>)};

 export default MovieSearch;