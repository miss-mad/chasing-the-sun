// unique key made within my Open Weather Map account
var apiKey = "c3b19024c0144f189152c979eec57ee8";

// you can make an API call using just the city name or by using a combination of the city name, state code, and country code
// accept user input and store in the city variable
// var city = "";
// console.log(city);

var button = $("#button");
console.log(button);
button.on("click", returnSearchInput);

function returnSearchInput() {
  console.log("function is working");
  var searchInput = $("#searchInput").val().trim();
  console.log(searchInput);
  if (searchInput === "") {
    console.log("empty string");
  } else {
    console.log("not an empty string");
  }
  return searchInput;
}

returnSearchInput();


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

// var queryURL = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
// Now that you have constructed a variable to hold your query URL, you can implement it in an API call using the Fetch API!

// once query URL is made, you need to call the Fetch API to pass the query URL in as a parameter
// be sure to first adjust app to accept user input and store it in the city variable
// fetch(queryURL)
//   .then(function (response) {
//     if (!response.ok) {
//       console.log(response.status);
//     //   document.location.replace("./404.html");
//     } else {
//       return response.json();
//     }
//   })
//   .then(function (data) {
//     console.log(data);
//   });
// once app is working, we can use the response data that's returned by the query in the application (this functions the same way as an API that doesn't require an API key)
