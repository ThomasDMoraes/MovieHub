# MovieHub Project

# To do:
Import necessary node modules as shown in the package JSON files for both frontend and backend.
The movie-app folder is the root directory for the ReactJS project and backend operations. run commands from there.
    
Running react project: Run ' npm start ' from the movie-app directory
Running backend NodeJS server: ' node backend/movieserver.js ' from the movie-app directory 

This is a movie theater app using React, AWS Cognito, ExpressJS, and OMDB API.
The necessary keys I used are all included.

**Please do not misuse them! Clean up once you're done!**

# Contents: 
The project is split into a NodeJS backend server, and a ReactJS frontend comprised of page components with React Bootstrap.

### Backend:
movieserver.js -> A NodeJS file that runs an ExpressJS instance to act as our local backend server. Contains RESTful APIs that process frontend data for the OMDB API usage, READ/WRITE MongoDB operations, and AWS Cognito validation of tokens.
        
APIkey.json -> Contains my free public OMDB API credentials.
        
cognitoUserPool.json -> Contains AWS Cognito user pool credentials.
        
mongoDBCred.json -> Contains needed MongoDB credentials to read/write on my database.


### Frontend (ReactJS):
App.js -> Acts as the top hierarchy component hierarchy for the frontend as its skeleton. Also contains routing for links to page components.
        
Account.js -> Provides an auth context containing custom methods and attributes gathered from AWS Cognito client-side operations. Used for auth throughout other components.
        
Footer.js -> A footer component providing a little more info on the project as well as social links.
        
Home.js -> The home page where users first land. Contains a carousel showcasing the 3 most popular movies among users, as well as some project info.
        
LoadingDots.js -> A basic loading component used throughout the app.
        
Login.js -> A page component divided into Login, Registration, and Confirmation tabs. Also makes calls to our backend server and AWS Cognito as needed.
        
MostSaved.js -> A page component containing a list of the most popular movies among users (up to 10).
        
Movie.js -> A card component with basic movie information, to be used with other components. Hovering fetches and displays some more information. Clicking navigates to its MovieInfo page.
        
MovieInfo.js -> A page component providing deeper information about the selected movie. Also holds an ADD / REMOVE button for logged in users to manage their watchlists.
        
MovieRatings.js -> DEPRECATED PAGE COMPONENT. Used to retrieve movies by IMDB rating using the old public IMDB api keys, but they are no longer available.
        
MovieSearch.js -> A page component containing a search bar that retrieves a list of movie as results.

MyNavbar.js -> A navbar component holding links to page components and buttons based on the user's logged in status.
        
UserPool.js -> Contains a UserPool object with credentials needed by the Account.js component.
        
Watchlist.js -> A page component containing the logged in user's watchlist (a list of movies they have saved).

# Demo: 
## Home page:
<img src="MovieHub gifs/Home gif.gif"/> 
    
## Login page:
<img src="MovieHub gifs/Login gif.gif"/> 
    
## Search page:
<img src="MovieHub gifs/Search gif.gif"/> 
    
## MovieInfo and Watchlist pages:
<img src="MovieHub gifs/MovieInfo and Watchlist gif.gif"/> 
    
## Most Saved page:
<img src="MovieHub gifs/Most Saved gif.gif"/> 
    
## Delete Account:
<img src="MovieHub gifs/Delete Account gif.gif"/> 


