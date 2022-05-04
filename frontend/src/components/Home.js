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
        <p>(write down app description)</p>

        {/*  */}
        {!loading && !user && <button onClick={() => {navigate('.././Login')}}>Go to Login Page</button>}
    </>)
 
 }
 
 export default Home;