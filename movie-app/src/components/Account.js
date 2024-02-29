import React, {createContext, useState} from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {CognitoUser, AuthenticationDetails} from "amazon-cognito-identity-js";
import Pool from "./UserPool";

import axios from "axios";

//notification pop-up messages
import {NotificationManager} from 'react-notifications';

/**
 * Context imported to utilize Account methods and attributes.
 */
const AccountContext = createContext();

/**
 * Contains authentication methods and attributes to use in pages.
 * @param {*} props given props (currently unused)
 * @returns {AccountContext} AccountContext containing functions and attributes
 */
const Account = (props) => {
    //used throughout the app to check if logged in
    const [status, setStatus] = useState(false);
    //used to redirect users
    const navigate = useNavigate();

    /**
     * Retrieves the current user's active AWS Cognito session if available.
     * Usually used to get user tokens for backend validation. 
     * @returns {Promise} a resolved or rejected promise
     */
    const getSession = () => {
        return new Promise((resolve, reject) => {
            const user = Pool.getCurrentUser();
            if (user) {
                user.getSession((err, session) => {
                    if (err) {
                        setStatus(false);
                        reject();
                    }
                    else {
                        setStatus(true);
                        resolve(session);
                    }
                })
            }
            else {
                setStatus(false);
            }
        });
    }

    //used for login authentication
    /**
     * Authentication using username and password.
     * Logs-in the user.
     * @param {String} Username user's username
     * @param {String} Password user's password
     * @returns {Promise} a resolved or rejected promise
     */
    const authenticate = async (Username, Password) => {
        return await new Promise((resolve, reject) => {
            const user = new CognitoUser({Username, Pool});
            const authDetails = new AuthenticationDetails({Username, Password});
    
            user.authenticateUser(authDetails, {
                onSuccess: (data) => {
                    console.log("onSuccess:", data);
                    setStatus(true);
                    resolve(data);
                },
                onFailure: (err) => {
                    console.error("onFailure:", err);
                    reject(err);
                },
                newPasswordRequired: (data) => {
                    console.log("newPasswordRequired:", data)
                    resolve(data);
                }
            })
        })
    }

    //returns current user object
    /**
     * Retrieves some of the active user's information if logged in.
     * @returns {CognitoUser} AWS CognitoUser object, or null
     */
    const getUser = () => {
        return Pool.getCurrentUser();
    }

    /**
     * Logs out the user.
     */
    const logout = () => {
        const user = Pool.getCurrentUser();
        if (user) {
            user.signOut();
            setStatus(false);
            console.log("logged out!");
            navigate('/');
        }
    };

    /**
     * Deletes user's account.
     * @param {String} username 
     */
    const deleteAccount = async (username) => {
        if (!username) {
            console.log("Missing user. Please try again.");
            NotificationManager.error("Missing user. Please try again.");
            return;
        }
        let confirm = window.confirm("Are you sure?");
        if (confirm) {
            NotificationManager.info("Deleting account...")
            getSession().then(async (sessionRes) => {
                await axios.delete("http://localhost:5500/DeleteAccount?username="+username, {headers: {"authorization": sessionRes.accessToken.jwtToken}})
                .then((response) => {
                    //case success
                    console.log("response:", response);
                    NotificationManager.success("Account deleted!");
                    logout();
                })
                .catch((error) => {
                    //case error
                    console.log("error:", error.data);
                    NotificationManager.error("Error deleting account.");
                })
            })
        }
        else {
            console.log("Deletion canceled.");
        }
    }


    return (
        <AccountContext.Provider value={{authenticate, getSession, logout, deleteAccount, getUser, status}}>
            {props.children}
        </AccountContext.Provider>
    )

};

export {Account, AccountContext};