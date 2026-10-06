const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");

const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const feelsLike = document.getElementById("feelsLike");
const condition = document.getElementById("condition");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");
const weatherIcon = document.getElementById("weatherIcon");

const errorMessage = document.getElementById("errorMessage");
const loadingMessage = document.getElementById("loadingMessage");


// ===============================
// API KEY
// ===============================

const apiKey = "3b6605ee005fdc206cfabc81447cae50";


// ===============================
// EVENT LISTENERS
// ===============================

searchBtn.addEventListener("click", getWeather);

cityInput.addEventListener("keypress", function(event) {

    if (event.key === "Enter") {
        getWeather();
    }

});

locationBtn.addEventListener("click", getLocation);


// ===============================
// SEARCH WEATHER BY CITY
// ===============================

async function getWeather() {

    const city = cityInput.value.trim();

    if (city === "") {

        errorMessage.textContent =
            "Please enter a city name.";

        loadingMessage.textContent = "";

        return;
    }

    errorMessage.textContent = "";

    loadingMessage.textContent =
        "Loading weather...";

    const url =
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;

    try {

        const response = await fetch(url);

        const data = await response.json();

        // Check API response
        if (!response.ok) {

            if (response.status === 401) {

                throw new Error(
                    "Invalid or inactive OpenWeather API key."
                );

            }

            if (response.status === 404) {

                throw new Error(
                    "City not found."
                );

            }

            throw new Error(
                data.message || "Unable to get weather data."
            );
        }

        displayWeather(data);

        loadingMessage.textContent = "";

    }

    catch (error) {

        loadingMessage.textContent = "";

        console.log("Weather error:", error);

        errorMessage.textContent =
            error.message;

    }
}


// ===============================
// DISPLAY WEATHER
// ===============================

function displayWeather(data) {

    cityName.textContent =
        `${data.name}, ${data.sys.country}`;

    temperature.textContent =
        `${Math.round(data.main.temp)}°C`;

    feelsLike.textContent =
        `Feels like: ${Math.round(data.main.feels_like)}°C`;

    condition.textContent =
        data.weather[0].description;

    humidity.textContent =
        data.main.humidity;

    windSpeed.textContent =
        data.wind.speed;

    setWeatherIcon(
        data.weather[0].main
    );
}


// ===============================
// WEATHER ICON
// ===============================

function setWeatherIcon(weather) {

    if (weather === "Clear") {

        weatherIcon.textContent = "☀️";

    }

    else if (weather === "Clouds") {

        weatherIcon.textContent = "☁️";

    }

    else if (weather === "Rain") {

        weatherIcon.textContent = "🌧️";

    }

    else if (weather === "Thunderstorm") {

        weatherIcon.textContent = "⛈️";

    }

    else if (weather === "Snow") {

        weatherIcon.textContent = "❄️";

    }

    else if (weather === "Drizzle") {

        weatherIcon.textContent = "🌦️";

    }

    else {

        weatherIcon.textContent = "🌤️";

    }
}


// ===============================
// GET USER LOCATION
// ===============================

function getLocation() {

    if (!navigator.geolocation) {

        loadingMessage.textContent = "";

        errorMessage.textContent =
            "Geolocation is not supported by your browser.";

        return;
    }

    loadingMessage.textContent =
        "Getting your location...";

    errorMessage.textContent = "";

    navigator.geolocation.getCurrentPosition(
        getWeatherByLocation,
        showLocationError,
        {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 0
        }
    );
}


// ===============================
// WEATHER BY LOCATION
// ===============================

async function getWeatherByLocation(position) {

    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    const weatherUrl =
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

    try {

        // Get weather
        const weatherResponse = await fetch(weatherUrl);

        if (!weatherResponse.ok) {
            throw new Error("Unable to get weather data.");
        }

        const weatherData = await weatherResponse.json();

        // Display weather
        displayWeather(weatherData);

        // Get more accurate location name
        const locationUrl =
            `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${apiKey}`;

        const locationResponse = await fetch(locationUrl);

        if (locationResponse.ok) {

            const locationData = await locationResponse.json();

            if (locationData.length > 0) {

                const location = locationData[0];

                const area =
                    location.local_names?.en ||
                    location.name;

                const city =
                    location.state ||
                    location.country;

                cityName.textContent =
                    `${area}, ${city}`;
            }
        }

        loadingMessage.textContent = "";

    } catch (error) {

        loadingMessage.textContent = "";

        console.log("Location error:", error);

        errorMessage.textContent =
            error.message;
    }
}


// ===============================
// LOCATION ERROR
// ===============================

function showLocationError(error) {

    loadingMessage.textContent = "";

    if (error.code === 1) {

        errorMessage.textContent =
            "Location permission was denied.";

    }

    else if (error.code === 2) {

        errorMessage.textContent =
            "Location information is unavailable.";

    }

    else if (error.code === 3) {

        errorMessage.textContent =
            "Location request timed out. Please try again.";

    }

    else {

        errorMessage.textContent =
            "Unable to get your location.";

    }
}