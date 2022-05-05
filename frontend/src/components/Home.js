//This is the home page
//Contains an app description and prompts the user to log in if they're not logged in

//useNavigation hook used for login button redirection
import { useNavigate } from 'react-router-dom';
//authentication imports
import { auth } from './Login'
//needed to check on firebase Auth state
import { useAuthState } from "react-firebase-hooks/auth";

function Home() {
    //authentication hook for authorization check
    const [user, loading, error] = useAuthState(auth);
    //used for authorization redirection
    const navigate = useNavigate();
    
    return (<>
        <h3>HOME page:</h3>
        <p>Navigate through the links to operate through the movie server.</p>
        <p> This is a Movie Theater app, which takes movie information from the IMDB database to display
            to our logged in users. Users can search for movies by matching titles, ID
            (for rating, which can also lead to deeper information), and showing the top 250 rated movies
            currently ranked by IMDB. Users can sign up and log in with their emails or through their
             google accounts. A Watchlist could be finished implementation in the near future.
        </p>

        {/*  */}
        {!loading && !user && <button onClick={() => {navigate('.././Login')}}>Go to Login Page</button>}
    </>)
 
 }
 
 export default Home;