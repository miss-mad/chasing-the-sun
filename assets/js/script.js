//CHANGE ALL HTTP TO HTTPS for Github pages

var button = $(".btn");

// function to retrieve the user input from the search bar
function getUserInput(event) {
  // prevents the default behavior that the html button element has of refreshing the page after clicking
  event.preventDefault();

  // retrieves the text (value) that the user puts into the search bar and trims it (takes out any extra spaces before or after the word(s))
  var userInput = $("#searchInput").val().trim();
  console.log(userInput);

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

  // three API calls within OpenWeather are used, so this determines which call is currently being used to determine which information to display - current weather, UV index or future forecast
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
    // separating the query terms from the base URL
    var parametersDailyForecast = `?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    // adding the query terms to the base URL
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

    // checks base URL type of the API call to determine which information to display in what order
    .then(function (data) {
      console.log("Weather Data: ", data);

      // because I went the current weather data (temp, humidity, and wind) to all display at the same time and in the same list as UV Index, the below if statements make the apiCall() function run again to get both sets of data before displaying the future 5-day forecast
      if (urlType === "currentWeather") {
        apiCall(data, "getUVIndex");
      }

      if (urlType === "getUVIndex") {
        displayCurrentWeather(data);
      }

      if (urlType === "dailyForecast") {
        // filter the array from 40 to 5
        const fiveDayForcastArray = data.list.filter(function (day, index) {
          if (day.dt_txt.includes("12:00:00")) {
            return day;
          }
        });

        // jQuery forEach method to loop through the displayDailyForecast() function for each day in the fiveDayForcastArray, which has been filtered down to show only 5 days at 12PM from the original 40 entries
        $(fiveDayForcastArray).each(function (day) {
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

// function to convert given Kelvin temperature from OpenWeather to Fahrenheit
function convertTempKToF(temp) {
  return ((temp - 273.15) * 9) / 5 + 32;
}

function displayCurrentWeather(data) {
  var userInput = $("#searchInput").val().trim();
  console.log(userInput);

  var todaysDate = moment().format("M/D/YYYY");

  // attribute selector by HTML ID for the div holding the current weather for searched city
  var currentWeatherDiv = $("#currentWeather");

  // city + date appears in bold as title/header
  var currentWeatherTitle = $("<h3>");
  currentWeatherTitle.css("font-weight", "bold");
  currentWeatherTitle.text(userInput + " " + todaysDate);

  // weather icon appears next to city + date
  var currentWeatherIcon = $("<img>");
  var weatherIconCode = data.current.weather[0].icon;
  var weatherIconUrl =
    "http://openweathermap.org/img/wn/" + weatherIconCode + ".png";
  currentWeatherIcon.attr("src", weatherIconUrl);

  // create <ul> and <li> elements to hold the weather data list
  var currentWeatherConditionsUl = $("<ul>");
  currentWeatherConditionsUl.attr("class", "list-group list-group-flush");

  var currentWeatherConditionsLi = $("<li>");
  currentWeatherConditionsLi.attr("class", "list-group-item");

  // four conditions follow as a list:
  // temp: degrees F
  // wind: MPH
  // humidity: %
  // uv index: + uvIndex() function to color coded for danger

  // toFixed() reduces the temperature decimal to 2 places
  var currentWeatherTemp = $("<li>").text(
    "Temp: " + convertTempKToF(data.current.temp).toFixed(2) + " °F"
  );
  var currentWeatherWind = $("<li>").text(
    "Wind: " + data.current.wind_speed + "MPH"
  );
  var currentWeatherHumidity = $("<li>").text(
    "Humidity: " + data.current.humidity + "%"
  );

  var uvIndexNumber = data.current.uvi;
  var currentWeatherUVIndexLi = $("<li>").text("UV Index: ");
  var uvIndexColorDiv = $("<div>").text(uvIndexNumber);
  uvIndexColorDiv.css("display", "inline");
  uvIndexColorDiv.css("padding", "2px 4px");
  uvIndexColorDiv.css("border-radius", "5px");
  uvIndexColorDiv.css("color", "white");

  // weather has a UV Index scale of 1-2 = green, 3-5 = moderate, 6-7 = severe, etc. and does not account for any index between 2-3, or 5-6, and so on. the below if/else/if statements have to account for the gap in numbers
  function uvIndex() {
    if (uvIndexNumber <= 2.5) {
      uvIndexColorDiv.css("background-color", "green");
    } else if (uvIndexNumber >= 2.51 && uvIndexNumber <= 5.5) {
      uvIndexColorDiv.css("background-color", "yellow");
    } else if (uvIndexNumber >= 5.51 && uvIndexNumber <= 7.5) {
      uvIndexColorDiv.css("background-color", "orange");
    } else if (uvIndexNumber >= 7.51 && uvIndexNumber <= 10.5) {
      uvIndexColorDiv.css("background-color", "red");
    } else {
      uvIndexColorDiv.css("background-color", "pink");
    }
  }
  uvIndex();

  // all created elements must be added on to an existing element in order to display on the page
  currentWeatherUVIndexLi.append(uvIndexColorDiv);

  currentWeatherConditionsLi.append(
    currentWeatherTemp,
    currentWeatherWind,
    currentWeatherHumidity,
    currentWeatherUVIndexLi
  );

  currentWeatherConditionsUl.append(currentWeatherConditionsLi);

  currentWeatherDiv.append(
    currentWeatherTitle,
    currentWeatherIcon,
    currentWeatherConditionsUl
  );

  // runs through the apiCall() function again to now display the 5-day forecast (function below)
  apiCall(data, "dailyForecast");
}

function displayDailyForecast(day) {
  // attribute selector by HTML ID for the div holding the 5-day future forecast for searched city
  var dailyForecastDiv = $("#dailyForecast");

  // create a box that show each future day for 5 days (loops 5 times because of forEach method on the filtered array within the fetch within the apiCall() function)
  var dailyForecastFiveDayDivs = $("<div>");
  dailyForecastFiveDayDivs.attr("class", "col-2");
  dailyForecastFiveDayDivs.css("padding", "8px");

  // create <ul> and <li> elements to hold the weather data list
  var dailyForecastFiveDayUl = $("<ul>");
  dailyForecastFiveDayUl.attr("class", "list-group list-group-flush");

  var dailyForecastFiveDayLi = $("<li>");
  dailyForecastFiveDayLi.attr("class", "list-group-item");
  dailyForecastFiveDayLi.css("list-style-type", "none");

  // this shows the next 5 days' dates as a result of the forEach method that filters the forecast data to only show a data set for one time snapshot for the next 5 days
  var futureDate = $("<li>").text(day.dt_txt);
  futureDate.css("font-weight", "bold");
  futureDate.split("0");
  console.log(futureDate);

  // weather icon appears for that day's forecast
  var dailyForecastFiveDayIcon = $("<img>");
  var weatherIconCode = day.weather[0].icon;
  var weatherIconUrl =
    "http://openweathermap.org/img/wn/" + weatherIconCode + ".png";
  dailyForecastFiveDayIcon.attr("src", weatherIconUrl);

  // three conditions follow as a list:
  // temp: degrees F
  // wind: MPH
  // humidity: %

  // toFixed() reduces the temperature decimal to 2 places
  var dailyForecastFiveDayTemp = $("<li>").text(
    "Temp: " + convertTempKToF(day.main.temp).toFixed(2) + " °F"
  );

  var dailyForecastFiveDayWind = $("<li>").text(
    "Wind: " + day.wind.speed + "MPH"
  );
  var dailyForecastFiveDayHumidity = $("<li>").text(
    "Humidity: " + day.main.humidity + "%"
  );

  // all created elements must be added on to an existing element in order to display on the page
  dailyForecastFiveDayLi.append(
    futureDate,
    dailyForecastFiveDayIcon,
    dailyForecastFiveDayTemp,
    dailyForecastFiveDayWind,
    dailyForecastFiveDayHumidity
  );

  dailyForecastFiveDayUl.append(dailyForecastFiveDayLi);

  dailyForecastFiveDayDivs.append(dailyForecastFiveDayUl);

  dailyForecastDiv.append(dailyForecastFiveDayDivs);
}

// function to display past cities that user has searched for by retrieving data from local storage
function displaySearchHistory() {
  // var userInput = $("#searchInput").val().trim();
  // clears search bar after user clicks the search button
  $("#searchInput").val("");
  // gets the search input item from local storage
  localStorage.getItem("userInput");

  // creates the search history display card with jQuery using bootstrap classes
  var searchHistoryDiv = $("#searchHistory");
  searchHistoryDiv.attr("class", "card text-center");
  searchHistoryDiv.css("width", "18rem");

  // creates the unordered list element for the list items to be nested into
  var searchHistoryUl = $("<ul>");
  searchHistoryUl.attr("class", "list-group list-group-flush");

  // creates the list items and loops through local storage to add each city searched, as it's searched
  var searchHistoryLi = $("<li>");
  searchHistoryLi.attr("class", "list-group-item");

  // not sure if order should be reversed and also not sure if I should append everything to div instead of stair-stepping
  searchHistoryDiv.append(searchHistoryUl);
  searchHistoryUl.append(searchHistoryLi);
}

// click listeners on the search button so that the below named functions will execute when user clicks "search"
button.on("click", getUserInput);
button.on("click", displaySearchHistory);
