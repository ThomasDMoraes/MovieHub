//Firebase authentication page for Logins / Registering
//Import the functions you need from the SDKs you need
//Note: followed/copied from doctor google at https://blog.logrocket.com/user-authentication-firebase-react-apps/

//To do: split the page in 2 horizontally for the 2 forms using a Grid
//integrate react-bootstrap for formatting
//maybe use the CSS files from the tutorial



import { initializeApp } from "firebase/app";

//authentication modules
import { getAuth, GoogleAuthProvider, signInWithPopup,
         signInWithEmailAndPassword, createUserWithEmailAndPassword,
         signOut } from "firebase/auth";

//database modules
import { getFirestore, query, getDocs,
         collection, where, addDoc } from "firebase/firestore"

//Firebase hook
import { useAuthState } from "react-firebase-hooks/auth";

//react modules
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

//used to send API tokens to the backend server
import axios from 'axios';


//Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyDe3ZXP8zoqyzNwTS_ah4RYzhEYmQJbxt4",
  authDomain: "cot4930-fullstack-final.firebaseapp.com",
  projectId: "cot4930-fullstack-final",
  storageBucket: "cot4930-fullstack-final.appspot.com",
  messagingSenderId: "802492915657",
  appId: "1:802492915657:web:bfc9f5a6d3dfc204d8d218"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//Initializing Firebase authentication
const auth = getAuth(app);
//users' database
const db = getFirestore(app)

//tries to connect through google authentication
//creates a new database record if the user is not found
const googleProvider = new GoogleAuthProvider();
const signInWithGoogle = async () => {
    try {
        const res = await signInWithPopup(auth, googleProvider);
        const user = res.user;
        //looking for existing account in the 'users' database
        const q = query(collection(db, "users"), where("uid", "==", user.uid));
        const docs = await getDocs(q);
        if (docs.docs.length === 0) {   //no account, records info for later use
            await addDoc(collection(db, "users"), {
                uid: user.uid,
                name: user.displayName,
                authProvider: "google",
                email: user.email
            });
        }
    } 
    //error case
    catch (err) {
        console.error(err);
        alert(err.message);
    }
};

//Email and password login
//authenticates a user who is already registered
const logInWithEmailAndPassword = async (email, password) => {
    try {
        await signInWithEmailAndPassword(auth, email, password);
    }
    //error case
    catch (err) {
        console.error(err);
        alert(err.message);
    }
};

//registering a new user with email and password
//note: duplicates are not checked for
const registerWithEmailAndPassword = async (email, password) => {
    try {
        //authentication
        const res = await createUserWithEmailAndPassword(auth, email, password);
        const user = res.user;
        //adding user id and email to the Firebase database
        await addDoc(collection(db, "users"), {
            uid: user.uid,
            authProvider: "local",
            email
      });
    } 
    //error case
    catch (err) {
        console.error(err);
        alert(err.message);
    }
};

//logs out the user using Firebase
const logout = () => {
    signOut(auth);
};

//gets token
//sends token to backend
//verify token in backend to allow nested endpoints
//retrieves success or error console response
//used in every react page when rendered
const logInCheck = () => {
    if (!auth.currentUser) {
        console.log("not logged in (yet).");
    }
    else {
        console.log("logged in.");
        auth.currentUser.getIdToken(true)
        .then(idToken => {
        // Send token to your backend with axios request
        axios.get('http://localhost:5500/verifyUser?idToken=' + idToken)
            .then((response) => {
                console.log("response:", response)           
            })
        })
        //not logged in (invalid token)
        .catch(error => {
            console.log("logInCheck error.")
        });
    }
}

//login function that implements the other functions to operate on the react app
function Login() {
    //user form inputs
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [registerEmail, setRegisterEmail] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");
    //used for authentication
    const [user, error] = useAuthState(auth);
    //used to redirect users
    const navigate = useNavigate();

    //certified users are redirected to the Home page

    useEffect(() => {
        if (user) {
            navigate("./../");
        }
    }, [user]); //re-renders when user state changes

    return (<>
        {/* Login section */}
        <div className="login">
            {/* renders a login form */}
            <div className="login__container">
                <h2>Login:</h2>
                {/* Login email field */}
                <label htmlFor="login_email">Email: </label>
                <input type="text" className="login__textBox" id="login_email" value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="E-mail Address"/> <br/> <br/>

                {/* Login password field */}
                <label htmlFor="login_password">Password: </label>
                <input type="password" className="login__textBox" id="login_password" value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Password"/> <br/> <br/>

                {/* Email Login button */}
                <button className="login__btn"
                onClick={() => logInWithEmailAndPassword(loginEmail, loginPassword)}>Login</button>
                <br/> <br/>

                {/* Google Login button */}
                <button className="login__btn login__google" onClick={signInWithGoogle}>Login with Google</button>
            </div>
            <br/> <br/> <br/>

            {/* Register section */}
            <div className="register">
                <div className="register__container">
                    <h2>Register:</h2>
                    {/* Register email field */}
                    <input type="text" className="register__textBox" value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder="E-mail Address"/> <br/> <br/>

                    {/* Register password field */}
                    <input type="password" className="register__textBox" value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder="Password"/> <br/> <br/>

                    {/* Register button */}
                    <button className="register__btn"
                    onClick={() => registerWithEmailAndPassword(registerEmail, registerPassword)}>Register</button>
                    <br/> <br/>
                </div>
            </div>
        </div>
    </>);
}



export default Login;
export { auth, db, logout, logInCheck};
