// function to retrieve the user input from the search bar
function getUserInput(event) {
  // prevents the default behavior that the html button element has of refreshing the page after clicking
  event.preventDefault();

  // retrieves the text (value) that the user puts into the search bar and trims it (takes out any extra spaces before or after the word(s))
  var userInput = $("#searchInput").val().trim();
  // places user input in local storage for displaying later
  localStorage.setItem("search input", userInput);
  console.log("userInput: ", userInput);

  // calls another function, apiCall(), detailed below, and passes in two parameters
  apiCall(userInput, "currentWeather");
}

// function to execute the API call for the OpenWeather API, passing in two parameters
function apiCall(userInput, urlType) {
  var queryURL = "";

  // two API calls within OpenWeather are used, so this determines which is currently being used right now to determine which information to display - current or future forecast
  if (urlType === "currentWeather") {
    queryURL = "http://api.openweathermap.org/data/2.5/weather";
  } else if (urlType === "dailyForecast") {
    queryURL = "WHAT EVER THE DAILY FORECAST URL IS GOES HERE";
  } else {
    queryURL = "http://api.openweathermap.org/data/2.5/weather";
  }

  // unique key made within my Open Weather Map account
  var apiKey = "c3b19024c0144f189152c979eec57ee8";
  var city = userInput;

  // separating the query terms from the base URL
  var parameters = `?q=${city}&appid=${apiKey}`;

  // adding the query terms to the base URL
  queryURL = queryURL + parameters;

  // using the server-side API Fetch to return the API call
  fetch(queryURL)
    .then(function (response) {
      console.log(response);
      // if statement checks if the HTTP status code dictates that the status is ok (between 200-299) and if not, give the user an error so that they know there is an error
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })

    .then(function (data) {
      console.log("Weather Data: ", data);
    })
    // .catch is for catching user errors if they misspell or enter a nonexistent city
    .catch((error) => {
      console.log("Error from API: ", error);
      //   alert("ERROR - please make sure you have spelled the city correctly")
    });
}

// function to display past cities that user has searched for by retrieving data from local storage
function displaySearchHistory() {
  // clears search bar after pressing the search button
  $("#searchInput").val("");
  // gets the search input item from local storage
  localStorage.getItem("searchInput");

  //   searching.text(searchInput);
  //   searching.append(searchInput);
}

// click listeners on the search button so that the below named functions will execute when user clicks "search"
var button = $(".btn");
button.on("click", getUserInput);
button.on("click", displaySearchHistory);

// you can make an API call using just the city name or by using a combination of the city name, state code, and country code
// specify state and country variables in the API call bc some states or countries might have cities of the same name

// after making variables to store the API key and the user input for the city, you can construct a query URL, which you'll use to make the API call
// use URL associated with Current Weather Data
// to use other data points from the API, use the URL listed in that section of the documentation

// example of how to make an API call using just the city name and replace URL placeholders with created variables:

// look at parameters section of the documentation (after API call section)
// parameters are the variable search terms that you can add to an API call to specify the data requested
// 2 are required: q and appid
// q = query parameter, where you add the city variable
// appid = the application id or key, where you add the API key variable

// new variable that concatenates the OpenWeather Current Weather Data URL + the necessary variables
// http://api.openweathermap.org/data/2.5/weather is the base URL for calling the Current Weather Data API
// the question mark (?) marks the boundary between the base URL of the API call and the query terms of the API call
// q= is the query parameter, where we can add any user input to specify the data that we want to request in the API call. The value assigned to this parameter is called the query string
// following the query parameter, we concatenate the user input, which is stored in the variable city. This is the query string assigned to the query parameter
// the ampersand character (&) indicates that we're adding another parameter after the query parameter
// then, we concatenate the other required parameter, appid=, where we'll add the API key specific to the application
// finally, we concatenate the APIKey variable that contains the key we obtained at the beginning of this guide

// Now that you have constructed a variable to hold your query URL, you can implement it in an API call using the Fetch API!

// once query URL is made, you need to call the Fetch API to pass the query URL in as a parameter
// be sure to first adjust app to accept user input and store it in the city variable

// once app is working, we can use the response data that's returned by the query in the application (this functions the same way as an API that doesn't require an API key)

/*
    1. User types in city DONE
    2. We capture value of city DONE
    3. We put city into the query string
    4. We use fetch data using the query string that we just built
    5. We take the data that is returned and we display that to the page
 */
