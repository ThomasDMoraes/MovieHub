//Movie component
//Used with props to create cards holding movie information in other pages
//Also shows some information when hovering the cards

import { useState } from 'react';
//Nav imports
import { Routes, Route, Link} from 'react-router-dom';
import axios from 'axios';

//components
import MovieInfo from './MovieInfo';
import LoadingDots from './LoadingDots';

//React Bootstrap imports
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';


//takes props from the mapping
/**
 * Contains a movie card.
 * Hovering shows some more info.
 * Clicking will navigate the user to the movie's page with even more info.
 * @param {*} props movie attributes for mapping
 */
function Movie(props) {
    //initializing hooks
    const [movieData, setMovieData] = useState(); //more data granted apart from the passed props, to be shown when hovering cards
    const [loading1, setLoading1] = useState(true); //for movie info

    /**
     * Calls for a search of short data on the selected movie.
     * To be triggered when hovering cards.
     */
    let hoverSearch = () => {
        if (!movieData) {
            axios.get('http://localhost:5500/movie?movie_id=' + props.movie_id + "&plot=short")
            .then((res) => {
                console.log("response:", res.data);
                setMovieData(res.data);
            })
            .catch((error) => {
                console.log("Movie not found. Error:", error);
            })
            .finally(() => {
                setLoading1(false);
            })
        }
    }

    
    return (
        <OverlayTrigger
        placement="right"
        delay={{show: 300, hide: 100}}
        onEnter= {() => hoverSearch()}
        overlay={
        <Tooltip>
            {loading1 && <LoadingDots></LoadingDots>}
            {!loading1 && movieData.Title && 
            <Container>
                <Row>
                    <h5>{movieData.Title}</h5>
                </Row>
                <Row>
                    <p>Plot: {movieData.Plot}</p>
                </Row>
                <Row>
                    <p>Rating: {movieData.imdbRating}</p>
                </Row>
            </Container>
            }
        </Tooltip>}
        >
            {/*Movie card*/}
            <Card className="mb-5 movie-card" rounded >
                <Link className="text-decoration-none" to = {'/MovieInfo/' + props.movie_id}>
                    <Card.Img variant="top" src={props.image} className="movie-card-img" alt="" rounded/>
                    <Card.Body>
                        <Card.Title className="text-center movie-card-title">{props.title} <br/> ({props.year})</Card.Title>
                    </Card.Body>   
                </Link>
                {/* Including a link to the corresponding MovieInfo page using a route, link, and ID prop */}
                <Routes>
                    <Route path = {'/MovieInfo' + props.movie_id} element={<MovieInfo/>} />
                </Routes>
                {/* optional footer containing the saved amount for each movie */}
                {/* there may be better ways of structuring this as a general component, but this will do. */}
                {props.savedCount && 
                <Card.Footer>
                    <b style={{opacity: "50%"}}>saved: {props.savedCount}</b>
                </Card.Footer>}
            </Card>
        </OverlayTrigger>
    )
}

export default Movie;