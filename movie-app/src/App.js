import './App.css';
//importing router tags
import { BrowserRouter, Routes, Route} from 'react-router-dom';
//importing components for the routes
import MyNavbar from './components/MyNavbar';
import Home from './components/Home';
import MovieSearch from './components/MovieSearch';
import MovieRatings from './components/MovieRatings';
import Watchlist from './components/Watchlist'
import Footer from './components/Footer';
import Login from './components/Login'
import MovieInfo from './components/MovieInfo';
import MostSaved from './components/MostSaved';
import { Account } from './components/Account';

//notification pop-up messages
import {NotificationContainer, NotificationManager} from 'react-notifications';
import 'react-notifications/lib/notifications.css';

/**
 * App component.
 * Holds everything together the highest component.
 * Includes routes to page components used throughout the app.
 */
function App() {
  return (
    //creating links to each of the routes
    //and linking the route paths to corresponding React components
    <BrowserRouter>
      <Account>
        <MyNavbar></MyNavbar>
        <Routes>
            <Route path = "/" element={<Home/>} />
            <Route path = "/search/*" element={<MovieSearch/>} />
            <Route path = "/rating/*" element={<MovieRatings/>} />
            {/* MovieInfo has movieId passed as children to use for re-rendering the page appropriately */}
            <Route path = "/MovieInfo/:movieId" element={<MovieInfo/>} />
            <Route path = "/Login" element={<Login/>} />
            <Route path = "/Watchlist" element={<Watchlist/>} />
            <Route path = "/MostSaved" element={<MostSaved/>} />
        </Routes>
        <Footer></Footer>
        <NotificationContainer/>
      </Account>
    </BrowserRouter>
  );
}

export default App;
