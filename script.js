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

const errorMessage =
    document.getElementById("errorMessage");

const errorText =
    document.getElementById("errorText");

const weatherContent =
    document.getElementById("weatherContent");


// Current weather

const cityName =
    document.getElementById("cityName");

const countryName =
    document.getElementById("countryName");

const weatherIcon =
    document.getElementById("weatherIcon");

const temperature =
    document.getElementById("temperature");

const weatherDescription =
    document.getElementById(
        "weatherDescription"
    );

const weatherRange =
    document.getElementById(
        "weatherRange"
    );


// Details

const wind =
    document.getElementById("wind");

const feelsLike =
    document.getElementById(
        "feelsLike"
    );

const humidity =
    document.getElementById(
        "humidity"
    );

const dewPoint =
    document.getElementById(
        "dewPoint"
    );

const pressure =
    document.getElementById(
        "pressure"
    );

const visibility =
    document.getElementById(
        "visibility"
    );


// Sunrise / Sunset

const sunrise =
    document.getElementById(
        "sunrise"
    );

const sunset =
    document.getElementById(
        "sunset"
    );


// Forecast

const hourlyForecast =
    document.getElementById(
        "hourlyForecast"
    );

const dailyForecast =
    document.getElementById(
        "dailyForecast"
    );


// Time

const currentTime =
    document.getElementById(
        "currentTime"
    );


// Rain

const rainContainer =
    document.getElementById(
        "rainContainer"
    );

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
            "Silakan masukkan nama kota."
        );

        return;

    }


    showLoading();


    try {

        const currentUrl =
            `${CURRENT_API}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=id`;


        const currentResponse =
            await fetch(currentUrl);


        const currentData =
            await currentResponse.json();

        if (!currentResponse.ok) {

            throw new Error(
                getApiErrorMessage(
                    currentResponse.status,
                    currentData
                )
            );

        }

        const forecastUrl =
            `${FORECAST_API}?lat=${currentData.coord.lat}&lon=${currentData.coord.lon}&appid=${API_KEY}&units=metric&lang=id`;


        const forecastResponse =
            await fetch(
                forecastUrl
            );


        const forecastData =
            await forecastResponse.json();


        if (!forecastResponse.ok) {

            throw new Error(
                getApiErrorMessage(
                    forecastResponse.status,
                    forecastData
                )
            );

        }

        displayCurrentWeather(
            currentData
        );


        displayHourlyForecast(
            forecastData
        );


        displayDailyForecast(
            forecastData
        );

        changeWeatherTheme(
            currentData.weather[0].id
        );

        hideError();

        weatherContent.classList.remove(
            "hidden"
        );


    } catch (error) {

        console.error(
            "Weather Error:",
            error
        );


        weatherContent.classList.add(
            "hidden"
        );


        showError(
            error.message
        );


    } finally {

        hideLoading();

    }

}

function displayCurrentWeather(
    data
) {

    cityName.textContent =
        data.name;


    countryName.textContent =
        getCountryName(
            data.sys.country
        );


    temperature.textContent =
        Math.round(
            data.main.temp
        );


    weatherDescription.textContent =
        capitalize(
            data.weather[0].description
        );


    weatherRange.textContent =
        `Min ${Math.round(data.main.temp_min)}° / Max ${Math.round(data.main.temp_max)}°`;


    weatherIcon.src =
        `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;


    weatherIcon.alt =
        data.weather[0].description;


    feelsLike.textContent =
        `${Math.round(data.main.feels_like)}°`;


    humidity.textContent =
        `${data.main.humidity}%`;


    wind.textContent =
        `${data.wind.speed.toFixed(1)} m/s`;


    pressure.textContent =
        `${data.main.pressure} hPa`;


    visibility.textContent =
        `${(data.visibility / 1000).toFixed(1)} km`;


    const dew =
        calculateDewPoint(
            data.main.temp,
            data.main.humidity
        );


    dewPoint.textContent =
        `${Math.round(dew)}°`;


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

function displayHourlyForecast(
    data
) {

    hourlyForecast.innerHTML =
        "";


    /*
        Mengambil 8 data forecast
        pertama menggunakan slice().
    */

    const hours =
        data.list.slice(
            0,
            8
        );


    /*
        map() digunakan untuk
        mengubah data API menjadi
        struktur HTML.
    */

    const html =
        hours.map(
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


                return `

                    <div
                        class="hour-item ${
                            index === 0
                                ? "active"
                                : ""
                        }"
                    >

                        <div class="hour-time">

                            ${
                                index === 0
                                    ? "Sekarang"
                                    : time
                            }

                        </div>


                        <img
                            src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png"
                            alt="${item.weather[0].description}"
                        >


                        <div class="hour-temp">

                            ${Math.round(
                                item.main.temp
                            )}°

                        </div>

                    </div>

                `;

            }
        ).join("");


    hourlyForecast.innerHTML =
        html;

}

function displayDailyForecast(
    data
) {

    dailyForecast.innerHTML =
        "";


    /*
        Kelompokkan data berdasarkan
        tanggal.
    */

    const groupedDays = {};


    data.list.forEach(
        (item) => {

            const date =
                new Date(
                    item.dt * 1000
                );


            const dateKey =
                date.toLocaleDateString(
                    "en-CA"
                );


            if (!groupedDays[dateKey]) {

                groupedDays[dateKey] = [];

            }


            groupedDays[dateKey].push(
                item
            );

        }
    );


    /*
        Object.values() digunakan
        untuk mengambil seluruh
        kelompok forecast.
    */

    const days =
        Object.values(
            groupedDays
        ).slice(
            0,
            5
        );


    const html =
        days.map(
            (dayItems, index) => {

                /*
                    Ambil data tengah hari
                    jika tersedia.
                */

                const selected =
                    dayItems.find(
                        (item) => {

                            const hour =
                                new Date(
                                    item.dt * 1000
                                ).getHours();

                            return (
                                hour >= 11 &&
                                hour <= 14
                            );

                        }
                    ) || dayItems[0];


                const temperatures =
                    dayItems.map(
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


                const dayName =
                    getDayName(
                        date,
                        index
                    );


                return `

                    <div class="day-item">

                        <div class="day-name">

                            ${dayName}

                        </div>


                        <div class="day-weather">

                            <img
                                src="https://openweathermap.org/img/wn/${selected.weather[0].icon}.png"
                                alt="${selected.weather[0].description}"
                            >

                        </div>


                        <div class="day-temperature">

                            ${Math.round(min)}°
                            /
                            ${Math.round(max)}°

                        </div>

                    </div>

                `;

            }
        ).join("");


    dailyForecast.innerHTML =
        html;

}

function changeWeatherTheme(
    weatherId
) {

    /*
        Bersihkan tema sebelumnya.
    */

    document.body.classList.remove(
        "sunny",
        "cloudy",
        "rainy",
        "stormy"
    );


    /*
        THUNDERSTORM
        200 - 299
    */

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


    /*
        DRIZZLE
        300 - 399
    */

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


    /*
        RAIN
        500 - 599
    */

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


    /*
        SNOW
        600 - 699
    */

    if (
        weatherId >= 600 &&
        weatherId < 700
    ) {

        document.body.classList.add(
            "cloudy"
        );

        return;

    }


    /*
        CLEAR
        800
    */

    if (
        weatherId === 800
    ) {

        document.body.classList.add(
            "sunny"
        );

        return;

    }


    /*
        CLOUDS
        801 - 804
    */

    if (
        weatherId >= 801 &&
        weatherId <= 804
    ) {

        document.body.classList.add(
            "cloudy"
        );

        return;

    }


    /*
        Default
    */

    document.body.classList.add(
        "cloudy"
    );

}

function createRain() {

    rainContainer.innerHTML =
        "";


    /*
        Membuat 100 tetesan air.
    */

    for (
        let i = 0;
        i < 100;
        i++
    ) {

        const drop =
            document.createElement(
                "span"
            );


        drop.classList.add(
            "raindrop"
        );


        /*
            Posisi random.
        */

        drop.style.left =
            `${Math.random() * 100}%`;


        /*
            Kecepatan random.
        */

        drop.style.animationDuration =
            `${0.45 + Math.random() * 0.7}s`;


        /*
            Delay random.
        */

        drop.style.animationDelay =
            `${Math.random() * 2}s`;


        /*
            Panjang tetesan random.
        */

        drop.style.height =
            `${12 + Math.random() * 16}px`;


        rainContainer.appendChild(
            drop
        );

    }

}

function getApiErrorMessage(
    status,
    data
) {

    if (
        status === 401
    ) {

        return (
            "API Key tidak valid atau belum aktif. " +
            "Periksa API Key OpenWeatherMap kamu."
        );

    }


    if (
        status === 404
    ) {

        return (
            "Kota tidak ditemukan. " +
            "Periksa kembali nama kota."
        );

    }


    if (
        status === 429
    ) {

        return (
            "Batas penggunaan API sudah tercapai."
        );

    }


    return (
        data.message ||
        "Gagal mengambil data cuaca."
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

function showError(
    message
) {

    errorText.textContent =
        message;


    errorMessage.classList.remove(
        "hidden"
    );

}


function hideError() {

    errorMessage.classList.add(
        "hidden"
    );

}

function formatTime(
    timestamp
) {

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

    if (
        index === 0
    ) {

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

function capitalize(
    text
) {

    return (
        text.charAt(0).toUpperCase() +
        text.slice(1)
    );

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

function getCountryName(
    code
) {

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

        /*
            Kota default.
        */

        cityInput.value =
            "Medan";


        /*
            Langsung ambil data
            ketika website dibuka.
        */

        searchWeather();

    }
);
