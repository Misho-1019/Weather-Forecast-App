const apiKey = 'c46c034df9772973702e479306e282b2';

const searchBtn = document.getElementById('search-btn');
const cityInput = document.getElementById('city-input');
const suggestionsList = document.getElementById('city-suggestions')
const locationBtn = document.getElementById('location-btn');

locationBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const {latitude, longitude} = position.coords;
                getWeatherByCoordinates(latitude, longitude)
                getForecastByCoordinates(latitude, longitude)
            },
            () => {
                showMessage('Unable to retrieve your location,', 'error')
            }
        )
    }else {
        showMessage('Geolocation is not supported by this browser.', 'error')
    }
})

async function getWeatherByCoordinates(lat, lon) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
        const data = await response.json();

        if (data.cod === 200) {
            const weatherCondition = data.weather[0].main.toLowerCase();
            const sunrise = data.sys.sunrise * 1000;
            const sunset = data.sys.sunset * 1000;
            const currentTime = Date.now();

             

            document.getElementById('city-name').textContent = data.name;
            document.getElementById('current-weather-icon').src = `http://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
            document.getElementById('current-weather-text').textContent = capitalizeFirstLetter(data.weather[0].description);
            document.getElementById('temperature').textContent = `${Math.floor(data.main.temp)}°`
            document.getElementById('feels-like').textContent = `Feels like: ${Math.floor(data.main.feels_like)}°`
            document.getElementById('humidity').textContent = `Humidity: ${data.main.humidity}%`
            document.getElementById('wind').textContent = `Wind Speed: ${data.wind.speed} m/s`

            document.getElementById('sunrise').textContent = `Sunrise: ${formatTime(sunrise)}`
            document.getElementById('sunset').textContent = `Sunset: ${formatTime(sunset)}`
        
            applyWeatherTheme(data.weather[0].main.toLowerCase())
        }else {
            showMessage('Error fetching weather data!', 'error')
        }
    } catch (error) {
        showMessage('Error fetching weather data!', 'error')
    }
}

async function getForecastByCoordinates(lat, lon) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
        const data = await response.json();

        const forecastContainer = document.getElementById('forecast-container');
        forecastContainer.innerHTML = '';

        if (data.cod === '200') {
            for (let i = 0; i < data.list.length; i+= 8) {
                const day = data.list[i];
                const forecastDay = document.createElement('div')
                forecastDay.classList.add('forecast-day')
                
                const iconUrl = `https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`;

                forecastDay.innerHTML = `
                    <div class="forecast-date">${formatDate(day.dt)}</div>
                    <img src="${iconUrl}" alt="Weather Icon" class="forecast-icon">
                    <div class="forecast-description">${capitalizeFirstLetter(day.weather[0].description)}</div>
                    <div class="forecast-temp">${Math.round(day.main.temp)}°</div>
                `;

                forecastContainer.appendChild(forecastDay)
            }
        }else {
            showMessage('Error fetching forecast data!', 'error')
        }
    } catch (error) {
        showMessage('Error fetching forecast data!', 'error')
    }
}

cityInput.addEventListener('input', async () => {
    const query = cityInput.value;

    if (query.length >= 2) {
        const suggestions = await getCitySuggestions(query);

        suggestionsList.innerHTML = '';

        suggestions.forEach(city => {
            const option = document.createElement('option')
            option.value = `${city.name}, ${city.country}`
            suggestionsList.appendChild(option)
        })
    }
})

async function getCitySuggestions(query) {
    const url = `http://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}`;

    try {
        const response = await fetch(url)
        const data = await response.json();

        if (response.ok) {
            return data;
        }else {
            console.error('Error fetching city suggestions:', data.message);
            return [];
        }
    } catch (error) {
        console.error('Error fetching city suggestions:', error);
        return[];
        
    }
}

searchBtn.addEventListener('click', () => {
    const city = cityInput.value;

    if (city) {
        getWeatherData(city)
        getForecastData(city)
        cityInput.value = '';
    }
    else {
        showMessage('Please enter a city name!')
    }
})

async function getWeatherData(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`)
        const data = await response.json();
        
        if (data.cod === 200) {
            const weatherCondition = data.weather[0].main.toLowerCase();
            const sunrise = data.sys.sunrise * 1000;
            const sunset = data.sys.sunset * 1000;
            const currentTime = Date.now();

            const dayTimeStatus = isDayTime(sunrise, sunset, currentTime);

            applyWeatherTheme(weatherCondition, dayTimeStatus)

            document.getElementById('city-name').textContent = data.name;
            document.getElementById('current-weather-icon').src = `http://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
            document.getElementById('current-weather-text').textContent = capitalizeFirstLetter(data.weather[0].description);
            document.getElementById('temperature').textContent = `${Math.floor(data.main.temp)}°`
            document.getElementById('feels-like').textContent = `Feels like: ${Math.floor(data.main.feels_like)}°`
            document.getElementById('humidity').textContent = `Humidity: ${data.main.humidity}%`
            document.getElementById('wind').textContent = `Wind Speed: ${data.wind.speed} m/s`

            document.getElementById('sunrise').textContent = `Sunrise: ${formatTime(sunrise)}`
            document.getElementById('sunset').textContent = `Sunset: ${formatTime(sunset)}`
        }
        else {
            showMessage('City not found!', 'error')
        }
    } catch (error) {
        showMessage('Error fetching weather data!')
    }
}

async function getForecastData(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`)
        const data = await response.json();
        
        const forecastContainer = document.getElementById('forecast-container');
        forecastContainer.innerHTML = '';
        
        if (data.cod === '200') {
            
            for (let i = 0; i < data.list.length; i+= 8) {
                const day = data.list[i]
                const forecastDay = document.createElement('div')
                forecastDay.classList.add('forecast-day')

                const iconUrl = `https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`;
                
                forecastDay.innerHTML = `
                    <div class="forecast-date">${formatDate(day.dt)}</div>
                    <img src="${iconUrl}" alt="Weather Icon" class="forecast-icon">
                    <div class="forecast-description">${capitalizeFirstLetter(day.weather[0].description)}</div>
                    <div class="forecast-temp">${Math.round(day.main.temp)}°</div>
                `;
                
                forecastContainer.appendChild(forecastDay)
            }
        }else {
            showMessage('Error fetching forecast data!', 'error')
        }
    } catch (error) {
        showMessage('Error fetching forecast data!')
    }
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
}

function formatDate(timestamp) {
    const date = new Date(timestamp * 1000)
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric'})
}

function showMessage(message, type = 'error') {

    const messageElement = document.getElementById('message')
    messageElement.textContent = message;

    messageElement.className = type === 'success' ? 'success' : 'error';

    messageElement.classList.remove('hidden');

    setTimeout(() => {
        messageElement.classList.add('hidden')
    }, 3000);
}

function applyWeatherTheme(condition, isDayTime) {
    const weatherContainer = document.querySelector('.weather-container');

    weatherContainer.classList.remove('sunny', 'cloudy', 'rainy', 'snowy', 'day', 'night')

    if (isDayTime) {
        weatherContainer.classList.add('day')
    }else {
        weatherContainer.classList.add('night')
    }


    if (condition.includes('clear')) {
        weatherContainer.classList.add('sunny')
    }else if (condition.includes('clouds')) {
        weatherContainer.classList.add('cloudy')
    }else if (condition.includes('rain')) {
        weatherContainer.classList.add('rainy')
    }else if (condition.includes('snow')) {
        weatherContainer.classList.add('snowy')
    }


    
}

function isDayTime(sunrise, sunset, currentTime) {
    return currentTime >= sunrise && currentTime < sunset;
}

function formatTime(timestamp) {
    const date = new Date(timestamp)
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}