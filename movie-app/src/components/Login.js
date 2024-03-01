//AWS Cognito authentication page for Logins / Registering
//Utilizes functions from the AWS JavaScript SDK

//react modules
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";

//component imports
import { AccountContext} from "./Account";
import UserPool from "./UserPool";
import { CognitoUserAttribute, CognitoUser } from "amazon-cognito-identity-js";
import LoadingDots from './LoadingDots';

import axios from 'axios';

//React Bootstrap imports
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

//notification pop-up messages
import {NotificationManager} from 'react-notifications';

/**
 * Login component page.
 * Includes a login, registration, and confirmation area.
 */
function Login() {
    //initializing hooks
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [registerEmail, setRegisterEmail] = useState("");
    const [registerUsername, setRegisterUsername] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");
    const [confirmationUsername, setConfirmationUsername] = useState("");
    const [confirmationCode, setConfirmationCode] = useState("");
    const [loading, setLoading] = useState(false);
    //used for authentication
    //const [user, error] = useAuthState(auth);
    const {authenticate, status} = useContext(AccountContext);
    //used to redirect users
    const navigate = useNavigate();

    //Redirects users back to Home page if they're logged in
    useEffect(() => {
        if (status) {
            navigate("/");
        }
    });
    
    /**
     * Logs in the user with email and password with the AccountContext methods for AWS Cognito.
     * @param {string} email user's email
     * @param {string} password user's password
     */
    const logInWithEmailAndPassword = (email, password) => {
        if (!email || !password) {
            console.log("Missing inputs. Please try again.");
            NotificationManager.error("Missing inputs. Please try again.");
            return;
        }

        setLoading(true);
        authenticate(email, password)
        .then((data) => {
            console.log("Logged in!\ndata:", data);
            NotificationManager.success("You have been logged in!");
            navigate('/'); //certified users are redirected to the Home page
        })
        .catch((err) => {            
            NotificationManager.error(err.message);
            console.error("Failed to login!\nerr:", err);
        })
        .finally(() => {
            setLoading(false);
        })
    };

    /**
     * Creates a user account in AWS Cognito (unconfirmed).
     * @param {string} username user's username
     * @param {string} email user's email
     * @param {string} password user's password
     */
    const registerWithEmailAndPassword = (username, email, password) => {
        if (!username || !email || !password) {
            console.log("Missing inputs. Please try again.");
            NotificationManager.error("Missing inputs. Please try again.");
            return;
        }

        setLoading(true);
        let emailAttribute = {Name: "email", Value: email};
        let usernameAttribute = {Name: "preferred_username", Value: username};
        let attributes = [
            new CognitoUserAttribute(emailAttribute),
            new CognitoUserAttribute(usernameAttribute)
        ];
        UserPool.signUp(username, password, attributes, null, (err, data) => {
            if (err) {
                NotificationManager.error(err.message);
                console.error(err);
            }
            else {
                NotificationManager.success("Sign up successful! \nPlease check your email for the verification code and input the code below");
                setConfirmationUsername(username);
            }
            console.log(data);
            setLoading(false);
        }); 
    };

    //
    /**
     * Confirms the user's account after registration using the emailed codes.
     * Calls createWatchlist method when confirmation is successful.
     * @param {string} username user's username
     * @param {string} code user's emailed code
     */
    const confirmUser = (username, code) => {
        if (!username || !code) {
            console.log("Missing inputs. Please try again.");
            NotificationManager.error("Missing inputs. Please try again.");
            return;
        }

        setLoading(true);
        console.log("Starting confirmation for", username);
        let u = new CognitoUser({Username: username, Pool: UserPool});
        console.log("User:", u);
        u.confirmRegistration(code, true, (err, data) => {
            if (err) {
                console.log("Confirm error:", err);
                console.log("resending code...");
                NotificationManager.error(err.message);
                u.resendConfirmationCode((err, data) => {
                    if (err) {
                        console.log("resend code error:", err);
                        NotificationManager.error(err.message);
                    }
                    else {
                        console.log("verification code reset and sent.");
                        NotificationManager.success("The registration code has been resent.");
                    }
                })
            }
            else {
                NotificationManager.success('Account confirmed! \nYou may now log in!');
                console.log("Account creation confirmed!"); 
                console.log("confirm data:", data);
                createWatchlist(username);
            }
            setLoading(false);
        });
    };

    /**
     * Makes a call to our NodeJS backend server to create the user's watchlist in MongoDB.
     * usernames must be unique.
     * @param {string} username user's username
     */
    const createWatchlist = (username) => {
        if (!username) {
            console.log("Missing inputs. Please try again.");
            NotificationManager.error("Missing inputs. Please try again.");
            return;
        }
        axios.post("http://localhost:5500/createWatchlist", {"username": username})
        .then((response) => {
            console.log("Watchlist created for user:", username);
            NotificationManager.info("watchlist created for user: "+ username);
        }).catch((error) => {
            console.log("Error: Watchlist creation failed for user:", username);
            NotificationManager.error(error.message);
        })
    };


    return (<>
        {/* Login section */}
        <Container>
            {loading && <LoadingDots></LoadingDots>}
            <Row>
                {/* Contains login, registration, and confirmation form cards*/}
                <Tabs
                    defaultActiveKey="login"
                    id="auth-tabs"
                    className="mb-3"
                    fill
                >
                    {/*Login section */}
                    <Tab eventKey="login" title="Login">
                        <Card bg="info" rounded>
                            <Card.Header>
                                <Card.Title className="center-text">
                                        <h1>Login</h1>
                                </Card.Title> 
                            </Card.Header>
                            <Card.Body>
                                <Form className="bg-info rounded p-2">
                                    <Form.Group className="px-3 text-center">
                                        <Card.Subtitle className="pb-2 border-bottom border-2"><h4>Email:</h4></Card.Subtitle>
                                        <Form.Control className="my-4" type="text" placeholder="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}></Form.Control>
                                        <Card.Subtitle className="pb-2 border-bottom border-2"><h4>Password:</h4></Card.Subtitle>
                                        <Form.Control className="my-4" type="password" placeholder="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}></Form.Control>
                                        <Button className="btn-primary border border-5 ms-1" style={{width:"50%"}} onClick={() => logInWithEmailAndPassword(loginEmail, loginPassword)}>Login</Button>
                                    </Form.Group>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Tab>
                    {/*Register section */}
                    <Tab eventKey="register" title="Register">
                        <Card bg="info" rounded>
                            <Card.Header>
                                <Card.Title className="center-text">
                                        <h1>Register</h1>
                                </Card.Title> 
                            </Card.Header>
                            <Card.Body>
                                <Form className="bg-info rounded p-2">
                                    <Form.Group className="px-3 text-center">
                                        <Row>
                                            <Col>
                                                <Card.Subtitle className="pb-2 border-bottom border-2"><h4>Username:</h4></Card.Subtitle>
                                                <Form.Control className="my-4" type="text" placeholder="username" value={registerUsername} onChange={(e) => setRegisterUsername(e.target.value)}></Form.Control>
                                            </Col>
                                            <Col>
                                                <Card.Subtitle className="pb-2 border-bottom border-2"><h4>Email:</h4></Card.Subtitle>
                                                <Form.Control className="my-4" type="text" placeholder="username" value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)}></Form.Control>
                                            </Col>
                                        </Row>
                                        <Card.Subtitle className="pb-2 border-bottom border-2"><h4>Password:</h4></Card.Subtitle>
                                        <Form.Control className="my-4" type="password" placeholder="password" value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)}></Form.Control>
                                            <Button className="btn-primary border border-5 ms-1" style={{width:"50%"}} onClick={() => registerWithEmailAndPassword(registerUsername, registerEmail, registerPassword)}>Register</Button>
                                    </Form.Group>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Tab>
                    {/*Confirmation section */}
                    <Tab eventKey="confirmation" title="Confirmation">
                        <Card className="d-flex text-center" bg="info" rounded>
                            <Card.Header>
                                <Card.Title className="center-text">
                                        <h1>Confirmation</h1>
                                </Card.Title> 
                            </Card.Header>
                            <Card.Body>
                            <Form className="bg-info rounded p-2">
                                <Form.Group className="px-3 text-center">
                                    <Card.Subtitle className="pb-2 border-bottom border-2"><h4>Username:</h4></Card.Subtitle>
                                    <Form.Control className="my-4" type="text" placeholder="username" value={confirmationUsername} onChange={(e) => setConfirmationUsername(e.target.value)}></Form.Control>
                                    <Card.Subtitle className="pb-2 border-bottom border-2"><h4>Code:</h4></Card.Subtitle>
                                    <Form.Control className="my-4" type="text" placeholder="confirmation code" value={confirmationCode} onChange={(e) => setConfirmationCode(e.target.value)}></Form.Control>
                                    <Button className="btn-primary border border-5 ms-1" style={{width:"50%"}} onClick={() => confirmUser(confirmationUsername, confirmationCode)}>Confirm</Button>
                                </Form.Group>
                            </Form>
                            </Card.Body>
                        </Card>
                    </Tab>
                </Tabs>
            </Row>
        </Container>
    </>);
}


export default Login;