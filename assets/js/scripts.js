const apiKey = '933e65b5e1b17373569ee1725fcc63ec';

// Convert wind speed from meters per second to miles per hour and determine the cardinal direction.
function convertWind(speedInMeters, degrees) {
    const speedMph = Math.round(speedInMeters * 2.23694);
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.floor(((degrees + 22.5) % 360) / 45);
    const cardinalDirection = directions[index];
    return {
        speedMph, cardinalDirection
    };
}

// Save a new search query to local storage if it's not already stored.
function saveSearchQuery(query) {
    let searches = JSON.parse(localStorage.getItem('searches')) || [];
    if (!searches.includes(query)) {
        searches.push(query)
        localStorage.setItem('searches', JSON.stringify(searches));
    }
}

// Clear all search history from local storage and update the UI.
function clearSearches() {
    let buttonContainer =$('#clearSearches');
    let button = $('<button> justify-content-center')
            .addClass('btn btn-danger m-1')
            .text('Clear Searches')
            .on('click', function() {
                localStorage.clear([0]);
                alert('Searches Cleared');
                handleUserInput(new Event('click'));
                location.reload();
            });
    buttonContainer.append(button);
}

// Create buttons for each stored search query to allow easy re-searching.
function makeSearchButtons() {
    let searches = JSON.parse(localStorage.getItem('searches')) || [];
    let buttonContainer = $('#previousSearches');
    buttonContainer.empty();
    searches.forEach(search => {
        let button = $('<button>')
            .addClass('btn btn-secondary m-1')
            .text(search)
            .on('click', function() {
                $('#searchQuery').val(search);
                handleUserInput(new Event('click'));
            });
        buttonContainer.append(button);
    });
}

// Fetch location data from OpenWeatherMap API based on city name.
async function getUserLocation (city,) {
    const location = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${apiKey}`;
    
    try {
        const response = await fetch(location, { method: 'GET' });
        const data = await response.json();
        return data[0];
    } catch (error) {
        console.error('Error:', error);
    }
}

// Fetch today's weather data using latitude and longitude.
async function getTodayForecast(lat, lon) {
    const weather = `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`

    try {
        const response = await fetch(weather, { method: 'GET' });
        const forecastData = await response.json();
        console.log(forecastData);
        return forecastData;
    } catch (error) {
        console.error('Error:', error);
    }
}

// Fetch a 5-day weather forecast using latitude and longitude.
async function getWeatherForecast(lat, lon) {
    const weather = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`

    try {
        const response = await fetch(weather, { method: 'GET' });
        const forecastData = await response.json();
        return forecastData;
    } catch (error) {
        console.error('Error:', error);
    }
}

// Create and display a weather card for today's weather data.
function createTodayWeatherCard(forecast) {
    const cityName = forecast.name
    const tempFahrenheit = Math.floor((forecast.main.temp - 273.15) * 9 / 5 + 32);
    const feelsLikeFahrenheit = Math.floor((forecast.main.feels_like - 273.15) * 9 / 5 + 32);
    const wind = convertWind(forecast.wind.speed, forecast.wind.deg);
    const weatherDescription = forecast.weather[0].description;
    const iconCode = forecast.weather[0].icon;
    const iconUrl = `http://openweathermap.org/img/wn/${iconCode}.png`;
    const formattedDate = dayjs(forecast.dt_txt).format('dddd, MMMM D, YYYY');
    const cardHtml = `
    <div class="card today-weather-card p-2">
        <h4 class="card-title text-center p-2">Today's Weather for: ${cityName}</h4>
        <h5 class="card-subtitle text-center">${formattedDate}</h5>
            <div class="row">
                <!-- Column for text elements -->
                <div class="flex col-6">
                    <p class="card-text mt-3 pb-2 text-center">Temp: ${tempFahrenheit} °F</p>
                    <p class="card-text pb-2 text-center">Feels like: ${feelsLikeFahrenheit} °F</p>
                    <p class="card-text pb-2 text-center">Wind: ${wind.speedMph} mph at ${wind.cardinalDirection}</p>
                    <p class="card-text pb-2 text-center">Cloudiness: ${forecast.clouds.all}%</p>
                    <p class="card-text pb-2 text-center">Humidity: ${forecast.main.humidity}%</p>
                </div>
                <!-- Column for the image card -->
                <div class="d-flex col-6">
                    <div class="container row justify-content-center">
                        <img src="${iconUrl}" alt="Weather Icon" class="img-fluid" id="todayWeatherIcon">
                        <span class="weather-description text-center">${weatherDescription}</span>
                    </div>   
                </div>
            </div>
    </div>
</div>
`;
$('#today-container').append(cardHtml);
}

// Create and display weather cards for a 5-day forecast.
function createWeatherCard(forecast) {
    console.log(forecast)
    const tempFahrenheit = Math.floor((forecast.main.temp - 273.15) * 9 / 5 + 32);
    const feelsLikeFahrenheit = Math.floor((forecast.main.feels_like - 273.15) * 9 / 5 + 32);
    const wind = convertWind(forecast.wind.speed, forecast.wind.deg);
    const weatherDescription = forecast.weather[0].description;
    const iconCode = forecast.weather[0].icon;
    const iconUrl = `http://openweathermap.org/img/wn/${iconCode}.png`;

    const formattedDate = dayjs(forecast.dt_txt).format('dddd, MMMM D, YYYY');
    const cardHtml = `
        <div class="card weather-card">
            <div class="card-body">
                <h5 class="card-title-date">${formattedDate}</h5>
                <h5 class="card-subtitle mb-2">
                <img src="${iconUrl}" alt="Weather Icon" style="vertical-align: middle;"> ${weatherDescription}
                </h6>
                <p class="card-text pb-2">Temp: ${tempFahrenheit} °F</p>
                <p class="card-text pb-2">Feels like: ${feelsLikeFahrenheit}°F</p>
                <p class="card-text pb-2">Wind: ${wind.speedMph} mph from the ${wind.cardinalDirection}</p>
                <p class="card-text pb-2">Cloudiness: ${forecast.clouds.all}%</p>
                <p class="card-text pb-2">Humidity: ${forecast.main.humidity}%</p>
            </div>
        </div>
    `;
    $('#forecast-container').append(cardHtml);
}

// Handles user input for city searches, fetches location and weather data, and updates UI.
async function handleUserInput(event) {
    event.preventDefault();
    const query = $('#searchQuery').val().trim();
    try{
        const locationData = await getUserLocation(query);
        const { lat , lon } = locationData;
        const todayWeatherData = await getTodayForecast(lat, lon);
        const weatherData = await getWeatherForecast(lat, lon);
        $('#forecast-container').empty();
        $('#today-container').empty();
        $('#clearSearches').empty();
        if (todayWeatherData && todayWeatherData.main) {
            createTodayWeatherCard(todayWeatherData);
        } 
        if (weatherData && weatherData.list) {
            const threePMForecasts = weatherData.list.filter(forecast => 
                forecast.dt_txt.endsWith('15:00:00'));
            threePMForecasts.forEach(forecast => {
                createWeatherCard(forecast);
            });
        }
        saveSearchQuery(query);
        makeSearchButtons();
        clearSearches();
    } catch (error) {
        console.log('Error: ', error);
        }
}

// Initialize the application and add event listeners when the document is ready.
$(document).ready(function(event) {
    $('#weatherForm').on('submit', handleUserInput);
    makeSearchButtons();
});