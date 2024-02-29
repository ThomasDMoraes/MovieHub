//This is the home page
//Contains a carousel showing top 3 most saved movies
//Contains some information about the website

import { useState, useEffect} from 'react';
import axios from 'axios';
//React Bootstrap imports

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import Card from 'react-bootstrap/Card';
import Carousel from 'react-bootstrap/Carousel';

//component imports
import LoadingDots from './LoadingDots';

//notification pop-up messages
import {NotificationManager} from 'react-notifications';

/**
 * Contains a carousel and website information.
 */
function Home() {
    //initializing hooks
    let [response, setResponse] = useState();
    const [loading, setLoading] = useState(true);

    //retrieving top n (currently set to 3) most saved movies
    var n = 3;
    useEffect(() => {
        setTimeout(() => {
            //using axios module to handle forms
            axios.get('http://localhost:5500/MostSaved?n='+n)
            .then((response) => {
                //case success
                console.log("response:", response);
                setResponse(response.data.movieList);
            })
            .catch((error) => {
                //case error
                console.log("error:", error.data);
                NotificationManager.warning("Server Error.")
            })
            .finally(() => {
                //always executed
                setLoading(false);
            })
        }, 100);
    }, []);

   
    return (
        <Container>
            {loading && <LoadingDots></LoadingDots>}
            {!loading && <>
            <Row className="justify-content-md-center">
                <Col xs lg-5>
                    {/*Currently using custom CSS classes for fonts, could be improved*/}
                    <h1 className="center-text title" >Welcome to MovieHub</h1>
                    <p className="center-text p-1"><i>A simple web application for us who love movies!</i></p>
                </Col>
            </Row>
            <Row className="justify-content-md-center">
                <Col>
                    {/*Could with the top 3 saved movies, or a placeholder for each if unavailable*/}
                    <Carousel fade className="bg-dark" >
                        {/* Slide 1 */}
                        <Carousel.Item>
                            <Image
                                className="center-img carousel-img"
                                //src={response[0].poster}
                                src={response? response[0].poster : ""}
                                alt="Carousel poster 1"
                                width="40%"
                                rounded
                            />
                            <Carousel.Caption className="image-caption">
                                <h3>#1 MOST SAVED</h3>
                            </Carousel.Caption>
                        </Carousel.Item>
                        {/* Slide 2 */}
                        <Carousel.Item>
                            <Image
                                className="center-img carousel-img"
                                src={response? response[1].poster : ""}
                                alt="Carousel poster 2"
                                width="40%"
                                rounded
                            />
                            <Carousel.Caption className="image-caption">
                                <h3>#2 MOST SAVED</h3>
                            </Carousel.Caption>
                        </Carousel.Item>
                        {/* Slide 3 */}
                        <Carousel.Item>
                            <Image 
                                className="center-img carousel-img"
                                src={response? response[2].poster : ""}
                                alt="Carousel poster 3"
                                width="40%"
                                rounded
                            />
                            <Carousel.Caption className="image-caption">
                                <h3>#3 MOST SAVED</h3>
                            </Carousel.Caption>
                        </Carousel.Item>
                    </Carousel>
                </Col>
            </Row>
            <Row>
                <Col className="p-3" xs lg-5>
                    {/* Card 1: Services */ }
                    <Card className="text-card" border="primary" bg="info">
                        <Card.Body>
                            <Card.Title className="card-title center-text text-card-title">Services</Card.Title>
                            <Card.Text>
                            <ul className="card-list">
                                <li>
                                    This website retrieves movie information from the OMDB database to display
                                    to our logged in users.
                                </li>
                                <li>
                                    Easy cloud-based registration and logins available.
                                </li>
                                <li>
                                    Search page for browsing through matching movies.
                                </li>
                                <li>
                                    A Watchlist is included for users to make a collection of movies that catch their interests.
                                </li> 
                                <li>
                                    Ratings page to find a specific movie's rating or browse through the top 250 rated movies. (REMOVED)
                                </li>
                                <li>
                                    Most Saved page shows the most popular movies among users.
                                </li>
                            </ul>
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col className="p-3">
                    {/* Card 2: Architecture */ }
                    <Card className="text-card" border="primary" bg="info">
                        <Card.Body>
                            <Card.Title className="card-title center-text text-card-title">Architecture</Card.Title>
                            <Card.Text>
                                <ul className="card-list">
                                    <li>
                                        ReactJS used for responsive front end web pages with React Bootstrap components.
                                    </li>
                                    <li>
                                        NodeJS local web server managing the database and our Express RESTful APIs by integrating with OMDB APIs.
                                    </li>
                                    <li>
                                        MongoDB local NoSQL database holds collections for each user's watchlists and saved movies.
                                    </li>
                                    <li>
                                        AWS Cognito provides authentication and authorization through the AWS JavaScript SDK.
                                    </li>
                                </ul>
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            </>}
        </Container>
    )
 }
 
 export default Home;