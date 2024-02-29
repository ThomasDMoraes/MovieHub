//This is the Most Saved Page
//contains a list of the most popular movies among users
//the movie information is retrieved from MongoDB

import { useState, useEffect} from 'react';
import axios from 'axios';

//component imports
import Movie from './Movie';
import LoadingDots from './LoadingDots';
//React Bootstrap imports
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';


/**
 * A component page showing the top N most saved movies.
 */
function MostSaved() {
    //initializing hooks
    let [response, setResponse] = useState({});
    const [loading, setLoading] = useState(true);

    //retrieving top n (currently set to 10) most saved movies
    var n = 10;
    useEffect(() => {
        //calling our API
        axios.get('http://localhost:5500/MostSaved?n='+n)
        .then((response) => {
            //case success
            console.log("response:", response);
            //and sets it as the response for the <div> on the website
            setResponse(response.data.movieList);
        })
        .catch((error) => {
            //case error
            console.log("error:", error.data);
            setResponse(error.data);
        })
        .finally(() => {
            //always executed
            setLoading(false);
        })
    }, []);

    //returns a list of the most saved movies
    return (
        <Container>
            <Row>
                <h1 className="text-center title border-5 border-bottom mb-5 pb-4">Most Saved</h1>
            </Row>
            {/* Movie list */}
            {loading && <LoadingDots></LoadingDots>}
            {!loading && 
            <Row fluid>
                <h1 className="mb-3 pb-2">Saved items ({response.length}):</h1>
                {response.length > 0 && 
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
                                    savedCount = {movie.savedCount}
                                />
                            </Col>)
                        })}
                    </Row>
                }
                {response.length === 0 && <h5>No saved movies at this time.</h5>}
            </Row>
            }
        </Container>);
}

 export default MostSaved;