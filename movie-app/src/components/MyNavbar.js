//Navbar component
//Contains links to web pages, connected in the App.js router

import { useContext, useEffect } from 'react';

//React Bootstrap imports
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { LinkContainer } from 'react-router-bootstrap';
import NavIcon from '../icons/play_icon.png'
import Image from 'react-bootstrap/Image';
import { AccountContext } from './Account';
import Button from 'react-bootstrap/esm/Button';

/**
 * Navbar component.
 * Contains links to component page
 * Also contains a logout and DELETE ACCOUNT button for logged in users
 */
function MyNavbar() {
  //authentication functions
  const { logout, status, getSession, getUser, deleteAccount } = useContext(AccountContext);

  //used to refresh the value of status when entering / refreshing the website
  useEffect(() => {
    getSession();
    console.log("status:", status);
  }, [])

  return (
    <>
      <Navbar bg="info" variant="dark" fixed="top" className="px-5">
        <LinkContainer to="/">
            <Navbar.Brand className="me-3 d-flex align-items-center">
              <Image className="mx-3" src={NavIcon} width="50"/>
              <h2><i>MovieHub</i></h2>
            </Navbar.Brand>
        </LinkContainer>
            <Nav className="me-auto sm-2" style={{fontSize:"1.2rem"}}>
              <LinkContainer to="/Search">
                <Nav.Link>Movies</Nav.Link>
              </LinkContainer>
              <LinkContainer to="/MostSaved">
                <Nav.Link>Most Saved</Nav.Link>
              </LinkContainer>
              {/*<LinkContainer to='/Rating'>
                <Nav.Link>Ratings</Nav.Link> 
              </LinkContainer>*/}
              {status && <LinkContainer to='/Watchlist'>
                <Nav.Link>Watchlist</Nav.Link> 
              </LinkContainer>}
              {status && 
                <Button onClick={logout}>Logout</Button>}
              {status &&
                <Button className="mx-3" variant="danger" onClick={() => {deleteAccount(getUser().username)}}>DELETE ACCOUNT</Button>}
              {!status && 
                <LinkContainer to='/Login'>
                  <Nav.Link>Login</Nav.Link> 
                </LinkContainer>}
            </Nav>
      </Navbar>
      <br /> <br /> <br /> <br />
    </>
  );
}

export default MyNavbar;