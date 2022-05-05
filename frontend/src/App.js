import './App.css';
//importing router tags
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
//importing components for the routes
import Home from './components/Home'
import MovieSearch from './components/MovieSearch'
import MovieRatings from './components/MovieRatings'
import Login from './components/Login'
import MovieInfo from './components/MovieInfo'
//import Watchlist from './components/Watchlist'
//import { process_params } from 'express/lib/router';
//used for authorization and logging out
import { auth, logout, logInCheck } from './components/Login'
//needed to check on firebase Auth state
import { useAuthState } from "react-firebase-hooks/auth";
import { useEffect } from 'react';


function App() {
  //returns current logged in user
  const [user, loading, error] = useAuthState(auth);

  //performs a logInCheck every time user changes
  //on every react page
  useEffect(() => {
    logInCheck();
  }, [user])

  return (
    //creating links to each of the routes
    //and linking the route paths to corresponding React components
    <BrowserRouter>
      <Link to='/'>Home</Link> <br />
      <Link to='/Search'>Movies</Link> <br />
      <Link to='/Rating'>Ratings</Link> <br />
      {/* Login link appears if user is not logged in (once firebase auth is loaded) */}
      {!loading && !user && <Link to='/Login'>Login</Link>}
      {/* Logout link if logged in. Redirects to the home page. */}
      {user && <Link to='/' onClick={logout}>Logout</Link>} <br/>
      {/* Showing that the user is logged in */}
      {user && <span>Logged in as: <strong>{user.email}</strong></span>} <br/>

      {/* watchlist link */}
      {/* user && <Link to='/Watchlist'>Watchlist</Link> */}
      
      <br /> <br /> <br /> 



      {/* Next: put Watchlist in the navbar */}
      {/* Next: Watchlist (list,delete) implementations, with login and mongoDB */}
      {/* Next: integrate bootstrap and work on propper Navbar + formatting / lists to Grids */}
      {/* Next: Finish writeup, readme, demo, and send */}


      <Routes>
        <Route path = "/" element={<Home/>} />
        <Route path = "/search/*" element={<MovieSearch/>} />
        <Route path = "/rating/*" element={<MovieRatings/>} />
        {/* MovieInfo has movieId passed as children to use for re-rendering the page appropriately */}
        <Route path = "/MovieInfo/:movieId" element={<MovieInfo/>} />
        <Route path = "/Login" element={<Login/>} />

        {/* Watchlist route (incomplete, thus not included) */}
        {/*<Route path = "/Watchlist" element={<Watchlist/>} />*/}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
