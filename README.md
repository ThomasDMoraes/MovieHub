# Final Project
## COT 4930 - Full Stack Web Development

To do: (keeping it brief since there's no time left)
    Import necessary node modules for Express, Firebase, MongoDB (check top of backend movieserver page) for the backend.
    Import necessary (check top of frontend pages) React modules for the frontend

    This is a movie theater app using React, Firebase, Express, and IMDB API.
    The necessary keys I used are all included.

    Contents:

    Backend:
        movieserver: NodeJS application serving as the backend. run the application with "node <pathing>" in the git terminal to start the server. The server runs IMDB API calls through its own endpoints. Contains Watchlist endpoints using MongoDB, in which only the /addToWatchlist has been proven to be functional as of yet. Firebase is used to verify user tokens from the frontend and allow the routes to be used.

        Others:
        there are JSON configuration files with necessary keys in the backend folder.
    
    Frontend (React):
        All pages require the user to be logged in before using the routes.

        App.js: Router page serving as the navbar. Contains links to all frontend pages.

        MovieSearch: Searches for movie matches using a partial title for the movie.

        MovieRatings: Similar to MovieSearch. Searches for a particular movie's rating given its movie ID from the IMDB database. Also contains a button to get and render the top 250 rated movies from the IMDB database in a list format.
    
        MovieInfo: Renders the selected movie from the MovieSearch or MovieInfo page with additional information for the user to see.

        Login: Contains a Register and Login section. Register and login can be done through email/password combinations and also directly through Google Accounts.




