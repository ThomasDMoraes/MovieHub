import './App.css';
//importing router tags
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
//importing useState hook
//import { useState } from 'react'
//importing components for the routes
import Home from './components/Home'
import MovieSearch from './components/MovieSearch'
import MovieRatings from './components/MovieRatings'
import Login from './components/Login'
//import MovieInfo from './components/MovieInfo'

function App() {
  //const [input, setInput] = useState("");

  return (
    //creating links to each of the routes
    //and linking the route paths to corresponding React components
    <BrowserRouter>
      <Link to='/'>Home</Link> <br />
      <Link to='/Search'>Movies</Link> <br />
      <Link to='/Rating'>Ratings</Link> <br />
      {/* <Link to='/Login'>Login</Link> */} <br /> <br /> <br /> 

      <Routes>
        <Route path = "/" element={<Home/>} />
        <Route path = "/search" element={<MovieSearch/>} />
        <Route path = "/rating" element={<MovieRatings/>} />
        {/* <Route path = "/Login" element={<Login/>} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
