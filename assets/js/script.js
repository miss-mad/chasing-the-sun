//CHANGE ALL HTTP TO HTTPS

var button = $(".btn");
// test cities
// var userInput = ["atlanta", "toronto", "test"];
// console.log(userInput.split(","));

// function to retrieve the user input from the search bar
function getUserInput(event) {
  // prevents the default behavior that the html button element has of refreshing the page after clicking
  event.preventDefault();

  // retrieves the text (value) that the user puts into the search bar and trims it (takes out any extra spaces before or after the word(s))
  var userInput = $("#searchInput").val().trim();

  if (!userInput) {
    alert("Please enter a city name");
    // need the return keyword to tell the computer not to execute the rest of the function if there is no value in the search bar. without this keyword, the function will replace what is already in local storage with the blank value
    return;
  }

  // places user input in local storage for displaying later
  localStorage.setItem("search input", userInput);
  console.log("userInput: ", userInput);

  // calls another function, apiCall(), detailed below, and passes in two parameters
  apiCall(userInput, "currentWeather");
}

// function to execute the API call for the OpenWeather API, passing in two parameters
function apiCall(incomingInformationFromMultipleSources, urlType) {
  var queryURL = "";
  // unique key made within my Open Weather Map account
  var apiKey = "c3b19024c0144f189152c979eec57ee8";

  // two API calls within OpenWeather are used, so this determines which is currently being used right now to determine which information to display - current or future forecast
  if (urlType === "currentWeather") {
    var city = incomingInformationFromMultipleSources;

    queryURL = "http://api.openweathermap.org/data/2.5/weather";
    // separating the query terms from the base URL
    var parametersCurrentWeather = `?q=${city}&appid=${apiKey}`;

    // adding the query terms to the base URL
    queryURL = queryURL + parametersCurrentWeather;
  }

  if (urlType === "getUVIndex") {
    var lat = incomingInformationFromMultipleSources.coord.lat;
    var lon = incomingInformationFromMultipleSources.coord.lon;

    queryURL = "https://api.openweathermap.org/data/3.0/onecall";
    // separating the query terms from the base URL

    var parametersCurrentWeatherUVIndex = `?lat=${lat}&lon=${lon}&appid=${apiKey}`;

    // adding the query terms to the base URL
    queryURL = queryURL + parametersCurrentWeatherUVIndex;
  }

  if (urlType === "dailyForecast") {
    var lat = incomingInformationFromMultipleSources.lat;
    var lon = incomingInformationFromMultipleSources.lon;

    queryURL = "https://api.openweathermap.org/data/2.5/forecast";
    var parametersDailyForecast = `?lat=${lat}&lon=${lon}&appid=${apiKey}`;

    queryURL = queryURL + parametersDailyForecast;
  }

  // using the server-side API Fetch to return the API call
  fetch(queryURL)
    .then(function (response) {
      console.log(response);
      // this if statement checks if the HTTP status code dictates that the status is ok (between 200-299) and if not, give the user an error so that they know there is an error
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })

    .then(function (data) {
      console.log("Weather Data: ", data);

      if (urlType === "currentWeather") {
        apiCall(data, "getUVIndex");
      }

      if (urlType === "getUVIndex") {
        displayCurrentWeather(data);
      }

      if (urlType === "dailyForecast") {

        // filter the arry from 40 to 5
        const fiveDayForcastArray = data.list.filter((day, index) => {
          if (day.dt_txt.includes("12:00:00")) {
            return day;
          }
        });

        fiveDayForcastArray.forEach((day) => {
          displayDailyForecast(day);
        });
      }
    })
    // .catch is for catching user errors if they misspell or enter a nonexistent city
    .catch(function (error) {
      console.log("Error from API: ", error);
      alert("ERROR - please make sure you have spelled the city correctly");
    });
}

function convertTempKToF(temp) {
  return ((temp - 273.15) * 9) / 5 + 32;
}

function displayCurrentWeather(data) {
  // make a box (div) for current weather for searched city
  // city + date appears in bold as title/header
  // weather icon appears next to city + date
  // four conditions follow as a list or grid:
  // temp: degrees F
  // wind: MPH
  // humidity: %
  // uv index: + color coded for danger

  var todaysDate = moment().format("M/D/YYYY");

  var currentWeatherDiv = $("#currentWeather");

  var currentWeatherTitle = $("<h3>");
  // var currentWeatherTitle = $("#currentWeather").val(); // wrong
  currentWeatherTitle.css("font-weight", "bold");
  currentWeatherTitle.text("Atlanta" + " " + todaysDate);

  var currentWeatherIcon = $("<img>");
  var weatherIconCode = data.current.weather[0].icon;
  var weatherIconUrl =
    "http://openweathermap.org/img/wn/" + weatherIconCode + ".png";
  currentWeatherIcon.attr("src", weatherIconUrl);

  var currentWeatherConditionsUl = $("<ul>");
  currentWeatherConditionsUl.attr("class", "list-group list-group-flush");

  var currentWeatherConditionsLi = $("<li>");
  currentWeatherConditionsLi.attr("class", "list-group-item");

  var currentWeatherTemp = $("<li>").text(
    "Temp: " + convertTempKToF(data.current.temp).toFixed(2) + " degrees F"
  );
  var currentWeatherWind = $("<li>").text(
    "Wind: " + data.current.wind_speed + "MPH"
  );
  var currentWeatherHumidity = $("<li>").text(
    "Humidity: " + data.current.humidity + "%"
  );
  var currentWeatherUVIndex = $("<li>").text("UV Index: " + data.current.uvi);

  currentWeatherConditionsLi.append(
    currentWeatherTemp,
    currentWeatherWind,
    currentWeatherHumidity,
    currentWeatherUVIndex
  );

  currentWeatherConditionsUl.append(currentWeatherConditionsLi);

  currentWeatherDiv.append(
    currentWeatherTitle,
    currentWeatherIcon,
    currentWeatherConditionsUl
  );

  apiCall(data, "dailyForecast");
}

function displayDailyForecast(day) {
  // make a box (div) for 5-day forecast for searched city
  // create text "5-Day Forecast" in bold as title
  // create 5 boxes that show each future day for 5 days
  // within each box:
  // date in bold at top
  // weather icon
  // temp: degrees F
  // wind: MPH
  // humidity: %

  // console.log("DATA: ", data);

  var dailyForecastDiv = $("#dailyForecast");

  var dailyForecastTitle = $("<h3>");
  dailyForecastTitle.css("font-weight", "bold");

  var dailyForecastFiveDayDivs = $("<div>");
  dailyForecastFiveDayDivs.attr("class", "col-2");

  var dailyForecastFiveDayUl = $("<ul>");
  dailyForecastFiveDayUl.attr("class", "list-group list-group-flush");

  var dailyForecastFiveDayLi = $("<li>");
  dailyForecastFiveDayLi.attr("class", "list-group-item");
  dailyForecastFiveDayLi.css("list-style-type", "none");

  // var futureDate = moment().format("M/D/YYYY");
  // var expires = moment(date).valueOf();
  // var expires = moment.utc(date).valueOf(); // try next
  var futureDate = $("<li>").text(day.dt_txt);

  var dailyForecastFiveDayIcon = $("<img>");
  var weatherIconCode = day.weather[0].icon;
  var weatherIconUrl =
    "http://openweathermap.org/img/wn/" + weatherIconCode + ".png";
  dailyForecastFiveDayIcon.attr("src", weatherIconUrl);

  var dailyForecastFiveDayTemp = $("<li>").text(
    "Temp: " + convertTempKToF(day.main.temp).toFixed(2) + " degrees F"
  );

  var dailyForecastFiveDayWind = $("<li>").text(
    "Wind: " + day.wind.speed + "MPH"
  );
  var dailyForecastFiveDayHumidity = $("<li>").text(
    "Humidity: " + day.main.humidity + "%"
  );

  //   console.log(day);
  // console.log(day.dt_text);

  dailyForecastFiveDayLi.append(
    futureDate,
    dailyForecastFiveDayIcon,
    dailyForecastFiveDayTemp,
    dailyForecastFiveDayWind,
    dailyForecastFiveDayHumidity
  );

  dailyForecastFiveDayUl.append(dailyForecastFiveDayLi);

  dailyForecastFiveDayDivs.append(dailyForecastFiveDayUl);

  dailyForecastDiv.append(dailyForecastTitle, dailyForecastFiveDayDivs);
}

// function to display past cities that user has searched for by retrieving data from local storage
function displaySearchHistory() {
  // var userInput = $("#searchInput").val().trim();
  // clears search bar after user clicks the search button
  $("#searchInput").val("");
  // gets the search input item from local storage
  localStorage.getItem("userInput");

  // creates the search history display card with jQuery using bootstrap classes
  var searchHistoryDiv = $("<div>");
  searchHistoryDiv.attr("class", "card text-center");
  searchHistoryDiv.css("width", "18rem");

  // creates the first row of the bootstrap card to be a header that gives a title to the search history
  var searchHistoryHeader = $("<div>");
  searchHistoryHeader.text("Search History");

  // creates the unordered list element for the list items to be nested into
  var searchHistoryUl = $("<ul>");
  searchHistoryUl.attr("class", "list-group list-group-flush");

  // creates the list items and loops through local storage to add each city searched, as it's searched
  var searchHistoryLi = $("<li>");
  searchHistoryLi.attr("class", "list-group-item");

  // need to convert strings (cities) to array with .split()
  // then jquery for each method in the array
  // userInput.split("");
  // console.log(userInput);
  // $(userInput).each(function(){

  // })

  // not sure if order should be reversed and also not sure if I should append everything to div instead of stair-stepping
  searchHistoryDiv.append(searchHistoryHeader);
  searchHistoryHeader.append(searchHistoryUl);
  searchHistoryUl.append(searchHistoryLi);
}

// click listeners on the search button so that the below named functions will execute when user clicks "search"
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
