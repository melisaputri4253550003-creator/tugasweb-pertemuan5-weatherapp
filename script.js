const API_KEY =
    "0886923f8456ea3467a07b0dd6b99119";


const CURRENT_API =
    "https://api.openweathermap.org/data/2.5/weather";


const FORECAST_API =
    "https://api.openweathermap.org/data/2.5/forecast";

const cityInput =
    document.getElementById("cityInput");

const searchButton =
    document.getElementById("searchButton");

const loading =
    document.getElementById("loading");

const errorBox =
    document.getElementById("errorBox");

const errorText =
    document.getElementById("errorText");

const weatherContent =
    document.getElementById("weatherContent");


const cityName =
    document.getElementById("cityName");

const countryName =
    document.getElementById("countryName");

const weatherIcon =
    document.getElementById("weatherIcon");

const temperature =
    document.getElementById("temperature");

const temperatureUnit =
    document.getElementById("temperatureUnit");

const weatherDescription =
    document.getElementById("weatherDescription");

const weatherRange =
    document.getElementById("weatherRange");


const hourlyForecast =
    document.getElementById("hourlyForecast");

const dailyForecast =
    document.getElementById("dailyForecast");


const wind =
    document.getElementById("wind");

const feelsLike =
    document.getElementById("feelsLike");

const humidity =
    document.getElementById("humidity");

const dewPoint =
    document.getElementById("dewPoint");

const pressure =
    document.getElementById("pressure");

const visibility =
    document.getElementById("visibility");


const sunrise =
    document.getElementById("sunrise");

const sunset =
    document.getElementById("sunset");

const currentTime =
    document.getElementById("currentTime");

const rainContainer =
    document.getElementById("rainContainer");

let currentWeatherData = null;

let currentForecastData = null;

let currentUnit = "C";

searchButton.addEventListener(
    "click",
    searchWeather
);


cityInput.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {

            searchWeather();

        }

    }
);

async function searchWeather() {

    const city =
        cityInput.value.trim();


    if (!city) {

        showError(
            "Masukkan nama kota terlebih dahulu."
        );

        return;

    }


    showLoading();

    hideError();


    try {

        const currentUrl =
            `${CURRENT_API}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=id`;


        const currentResponse =
            await fetch(currentUrl);


        const currentData =
            await currentResponse.json();


        if (!currentResponse.ok) {

            throw new Error(
                getErrorMessage(
                    currentResponse.status,
                    currentData
                )
            );

        }


        currentWeatherData =
            currentData;


        const forecastUrl =
            `${FORECAST_API}?lat=${currentData.coord.lat}&lon=${currentData.coord.lon}&appid=${API_KEY}&units=metric&lang=id`;


        const forecastResponse =
            await fetch(forecastUrl);


        const forecastData =
            await forecastResponse.json();


        if (!forecastResponse.ok) {

            throw new Error(
                getErrorMessage(
                    forecastResponse.status,
                    forecastData
                )
            );

        }


        currentForecastData =
            forecastData;


        displayCurrentWeather();

        displayHourlyForecast();

        displayDailyForecast();


        changeWeatherTheme(
            currentData.weather[0].id
        );


        weatherContent.classList.remove(
            "hidden"
        );


    } catch (error) {

        console.error(error);

        showError(
            error.message
        );

        weatherContent.classList.add(
            "hidden"
        );

    } finally {

        hideLoading();

    }

}

function displayCurrentWeather() {

    const data =
        currentWeatherData;


    cityName.textContent =
        data.name;


    countryName.textContent =
        getCountryName(
            data.sys.country
        );


    weatherIcon.src =
        `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;


    weatherIcon.alt =
        data.weather[0].description;


    updateTemperature();


    weatherDescription.textContent =
        capitalize(
            data.weather[0].description
        );


    weatherRange.textContent =
        `Min ${formatTemperature(data.main.temp_min)} / Max ${formatTemperature(data.main.temp_max)}`;


    feelsLike.textContent =
        formatTemperature(
            data.main.feels_like
        );


    humidity.textContent =
        `${data.main.humidity}%`;


    wind.textContent =
        `${data.wind.speed.toFixed(1)} m/s`;


    pressure.textContent =
        `${data.main.pressure} hPa`;


    visibility.textContent =
        `${(data.visibility / 1000).toFixed(1)} km`;


    dewPoint.textContent =
        `${Math.round(
            calculateDewPoint(
                data.main.temp,
                data.main.humidity
            )
        )}°`;


    sunrise.textContent =
        formatTime(
            data.sys.sunrise
        );


    sunset.textContent =
        formatTime(
            data.sys.sunset
        );


    currentTime.textContent =
        formatTime(
            Date.now() / 1000
        );

}

function updateTemperature() {

    if (!currentWeatherData) {

        return;

    }


    let temp =
        currentWeatherData.main.temp;


    if (currentUnit === "F") {

        temp =
            (temp * 9 / 5) + 32;

    }


    temperature.textContent =
        Math.round(temp);


    temperatureUnit.textContent =
        `°${currentUnit}`;

}


function formatTemperature(temp) {

    let value = temp;


    if (currentUnit === "F") {

        value =
            (temp * 9 / 5) + 32;

    }


    return `${Math.round(value)}°${currentUnit}`;

}

function displayHourlyForecast() {

    hourlyForecast.innerHTML = "";


    const hours =
        currentForecastData.list.slice(
            0,
            8
        );


    hours.forEach(
        (item, index) => {

            const date =
                new Date(
                    item.dt * 1000
                );


            const time =
                date.toLocaleTimeString(
                    "id-ID",
                    {
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                );


            const element =
                document.createElement(
                    "div"
                );


            element.className =
                "hour-item";


            if (index === 0) {

                element.classList.add(
                    "active"
                );

            }


            element.innerHTML = `

                <div class="hour-time">

                    ${
                        index === 0
                            ? "Sekarang"
                            : time
                    }

                </div>


                <img
                    src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png"
                    alt="${item.weather[0].description}"
                >


                <div class="hour-temp">

                    ${formatTemperature(
                        item.main.temp
                    )}

                </div>

            `;


            hourlyForecast.appendChild(
                element
            );

        }
    );

}

function displayDailyForecast() {

    dailyForecast.innerHTML = "";


    const groups = {};


    currentForecastData.list.forEach(
        item => {

            const date =
                new Date(
                    item.dt * 1000
                );


            const key =
                date.toLocaleDateString(
                    "en-CA"
                );


            if (!groups[key]) {

                groups[key] = [];

            }


            groups[key].push(item);

        }
    );


    const days =
        Object.values(groups).slice(
            0,
            5
        );


    days.forEach(
        (items, index) => {

            const selected =
                items.find(
                    item => {

                        const hour =
                            new Date(
                                item.dt * 1000
                            ).getHours();

                        return (
                            hour >= 12 &&
                            hour <= 14
                        );

                    }
                ) || items[0];


            const temperatures =
                items.map(
                    item =>
                        item.main.temp
                );


            const min =
                Math.min(
                    ...temperatures
                );


            const max =
                Math.max(
                    ...temperatures
                );


            const date =
                new Date(
                    selected.dt * 1000
                );


            const element =
                document.createElement(
                    "div"
                );


            element.className =
                "day-item";


            element.innerHTML = `

                <div class="day-name">

                    ${getDayName(
                        date,
                        index
                    )}

                </div>


                <div class="day-weather">

                    <img
                        src="https://openweathermap.org/img/wn/${selected.weather[0].icon}@2x.png"
                        alt="${selected.weather[0].description}"
                    >

                </div>


                <div class="day-temperature">

                    ${formatTemperature(min)}
                    /
                    ${formatTemperature(max)}

                </div>

            `;


            dailyForecast.appendChild(
                element
            );

        }
    );

}

function changeWeatherTheme(
    weatherId
) {

    document.body.classList.remove(
        "sunny",
        "cloudy",
        "rainy",
        "stormy"
    );


    rainContainer.innerHTML = "";

    if (
        weatherId >= 200 &&
        weatherId < 300
    ) {

        document.body.classList.add(
            "stormy"
        );

        createRain();

        return;

    }

    if (
        weatherId >= 300 &&
        weatherId < 400
    ) {

        document.body.classList.add(
            "rainy"
        );

        createRain();

        return;

    }

    if (
        weatherId >= 500 &&
        weatherId < 600
    ) {

        document.body.classList.add(
            "rainy"
        );

        createRain();

        return;

    }

    if (weatherId === 800) {

        document.body.classList.add(
            "sunny"
        );

        return;

    }


    // Clouds

    document.body.classList.add(
        "cloudy"
    );

}

function createRain() {

    for (
        let i = 0;
        i < 120;
        i++
    ) {

        const drop =
            document.createElement(
                "span"
            );


        drop.className =
            "raindrop";


        drop.style.left =
            `${Math.random() * 100}%`;


        drop.style.animationDuration =
            `${0.4 + Math.random() * 0.8}s`;


        drop.style.animationDelay =
            `${Math.random() * 2}s`;


        drop.style.opacity =
            `${0.3 + Math.random() * 0.7}`;


        rainContainer.appendChild(
            drop
        );

    }

}

const menuButton =
    document.getElementById(
        "menuButton"
    );

const closeMenu =
    document.getElementById(
        "closeMenu"
    );

const sideMenu =
    document.getElementById(
        "sideMenu"
    );

const menuOverlay =
    document.getElementById(
        "menuOverlay"
    );


menuButton.addEventListener(
    "click",
    openMenu
);


closeMenu.addEventListener(
    "click",
    closeMenuPanel
);


menuOverlay.addEventListener(
    "click",
    closeMenuPanel
);


function openMenu() {

    sideMenu.classList.add(
        "open"
    );

    menuOverlay.classList.add(
        "open"
    );

}


function closeMenuPanel() {

    sideMenu.classList.remove(
        "open"
    );

    menuOverlay.classList.remove(
        "open"
    );

}

document
    .querySelectorAll(
        ".menu-item[data-target]"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                function () {

                    const target =
                        document.getElementById(
                            this.dataset.target
                        );


                    closeMenuPanel();


                    setTimeout(
                        () => {

                            target.scrollIntoView({
                                behavior:
                                    "smooth",
                                block:
                                    "center"
                            });

                        },
                        250
                    );

                }
            );

        }
    );

const settingsButton =
    document.getElementById(
        "settingsButton"
    );

const closeSettings =
    document.getElementById(
        "closeSettings"
    );

const settingsPanel =
    document.getElementById(
        "settingsPanel"
    );

const settingsOverlay =
    document.getElementById(
        "settingsOverlay"
    );


settingsButton.addEventListener(
    "click",
    openSettings
);


closeSettings.addEventListener(
    "click",
    closeSettingsPanel
);


settingsOverlay.addEventListener(
    "click",
    closeSettingsPanel
);


function openSettings() {

    settingsPanel.classList.add(
        "open"
    );

    settingsOverlay.classList.add(
        "open"
    );

}


function closeSettingsPanel() {

    settingsPanel.classList.remove(
        "open"
    );

    settingsOverlay.classList.remove(
        "open"
    );

}

const unitSelect =
    document.getElementById(
        "unitSelect"
    );


unitSelect.addEventListener(
    "change",
    function () {

        currentUnit =
            this.value;


        if (
            currentWeatherData
        ) {

            displayCurrentWeather();

        }


        if (
            currentForecastData
        ) {

            displayHourlyForecast();

            displayDailyForecast();

        }

    }
);

const animationToggle =
    document.getElementById(
        "animationToggle"
    );


animationToggle.addEventListener(
    "change",
    function () {

        if (this.checked) {

            document.body.classList.remove(
                "no-animation"
            );

        } else {

            document.body.classList.add(
                "no-animation"
            );

        }

    }
);

function getErrorMessage(
    status,
    data
) {

    if (status === 401) {

        return (
            "API Key tidak valid atau belum aktif. " +
            "Periksa API Key OpenWeatherMap."
        );

    }


    if (status === 404) {

        return (
            "Kota tidak ditemukan. " +
            "Periksa nama kota."
        );

    }


    if (status === 429) {

        return (
            "Batas penggunaan API sudah tercapai."
        );

    }


    return (
        data.message ||
        "Gagal mengambil data cuaca."
    );

}


function showError(message) {

    errorText.textContent =
        message;

    errorBox.classList.remove(
        "hidden"
    );

}


function hideError() {

    errorBox.classList.add(
        "hidden"
    );

}

function showLoading() {

    loading.classList.remove(
        "hidden"
    );

}


function hideLoading() {

    loading.classList.add(
        "hidden"
    );

}

function capitalize(text) {

    return (
        text.charAt(0).toUpperCase() +
        text.slice(1)
    );

}


function formatTime(timestamp) {

    const date =
        new Date(
            timestamp * 1000
        );


    return date.toLocaleTimeString(
        "id-ID",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


function getDayName(
    date,
    index
) {

    if (index === 0) {

        return "Hari ini";

    }


    const days = [

        "Minggu",
        "Senin",
        "Selasa",
        "Rabu",
        "Kamis",
        "Jumat",
        "Sabtu"

    ];


    return days[
        date.getDay()
    ];

}


function calculateDewPoint(
    temperature,
    humidity
) {

    const a = 17.27;

    const b = 237.7;


    const gamma =
        (
            a * temperature
        ) /
        (
            b + temperature
        )
        +
        Math.log(
            humidity / 100
        );


    return (
        b * gamma
    ) /
    (
        a - gamma
    );

}


function getCountryName(code) {

    const countries = {

        ID: "Indonesia",
        MY: "Malaysia",
        SG: "Singapore",
        TH: "Thailand",
        JP: "Jepang",
        KR: "Korea Selatan",
        US: "Amerika Serikat",
        GB: "Inggris",
        AU: "Australia"

    };


    return (
        countries[code] ||
        code
    );

}

document.addEventListener(
    "DOMContentLoaded",
    function () {

        cityInput.value =
            "Medan";


        searchWeather();

    }
);
