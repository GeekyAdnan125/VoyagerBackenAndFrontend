/*
1. Temperature (Source: CDC & NOAA):
If temp < -10:
Suggest ["Thermal underwear", "Insulated boots", "Heavy coat"]

If -10 <= temp < 0:
Suggest ["Scarf", "Gloves", "Waterproof boots"]

If 0 <= temp < 10:
Suggest ["Warm jacket", "Long pants", "Light scarf"]

If 30 <= temp < 35:
Suggest ["Lightweight clothing", "Hydration pack", "Sunscreen"]

If temp >= 35:
Suggest ["Avoid sun from 12–4PM", "Stay hydrated", "UV-protective gear"]

2. UV Index (Source: WHO):
If uvIndex >= 3:
Add ["Sunscreen (SPF 30+)", "Sunglasses", "Sunhat"]

If uvIndex >= 6:
Add ["Seek shade", "Cover skin"]

If uvIndex >= 8:
Add ["Avoid direct sunlight", "Full coverage clothing"]

3. Rainfall (Source: UK Gov):
If rainfall > 50:
Add ["Waterproof boots", "Raincoat", "Rainproof backpack cover"]

If rainfall > 10:
Add ["Umbrella", "Water-resistant jacket"]
*/







import React, { useState } from "react";
import { useTranslation } from "react-i18next";


// Evidence-based travel packing recommendations
// Sources:
// - CDC & NOAA: https://www.cdc.gov/disasters/winter/beforestorm/preparehome.html, https://www.weather.gov/safety/heat-heatindex
// - WHO: https://www.who.int/news-room/questions-and-answers/item/radiation-the-ultraviolet-(uv)-index
// - UK Gov: https://www.gov.uk/guidance/travel-advice-novel-coronavirus#weather
export function getEvidenceBasedPacking({ temp, uvIndex, rainfall }) {
  console.log('getEvidenceBasedPacking called with:', { temp, uvIndex, rainfall });
  let items = [];

  // Temperature (CDC & NOAA)
  if (typeof temp === 'number') {
    console.log('Temp is a number:', temp);
    if (temp < -10) {
      console.log('Temp < -10');
      items.push("Thermal underwear", "Insulated boots", "Heavy coat");
    } else if (temp >= -10 && temp < 0) {
      console.log('-10 <= Temp < 0');
      items.push("Scarf", "Gloves", "Waterproof boots");
    } else if (temp >= 0 && temp < 10) {
      console.log('0 <= Temp < 10');
      items.push("Warm jacket", "Long pants", "Light scarf");
    } else if (temp >= 10 && temp < 30) {
      console.log('10 <= Temp < 30');
      items.push("T-shirt", "Light pants", "Comfortable shoes");
      console.log('Added moderate temp suggestions:', items);
    } else if (temp >= 30 && temp < 35) {
      console.log('30 <= Temp < 35');
      items.push("Lightweight clothing", "Hydration pack", "Sunscreen");
    } else if (temp >= 35) {
      console.log('Temp >= 35');
      items.push("Avoid sun from 12–4PM", "Stay hydrated", "UV-protective gear");
    }
  } else {
    console.log('Temp is not a number:', temp);
  }

  // UV Index (WHO)
  if (typeof uvIndex === 'number') {
    console.log('uvIndex is a number:', uvIndex);
    if (uvIndex > 0) {
      console.log('uvIndex > 0');
      items.push("Sunscreen", "Hat");
      console.log('Added uvIndex > 0 suggestions:', items);
    }
    if (uvIndex >= 3) {
      console.log('uvIndex >= 3');
      items.push("Sunscreen (SPF 30+)", "Sunglasses", "Sunhat");
    }
    if (uvIndex >= 6) {
      console.log('uvIndex >= 6');
      items.push("Seek shade", "Cover skin");
    }
    if (uvIndex >= 8) {
      console.log('uvIndex >= 8');
      items.push("Avoid direct sunlight", "Full coverage clothing");
    }
  } else {
    console.log('uvIndex is not a number:', uvIndex);
  }

  // Rainfall (UK Gov)
  if (typeof rainfall === 'number') {
    console.log('rainfall is a number:', rainfall);
    if (rainfall > 50) {
      console.log('rainfall > 50');
      items.push("Waterproof boots", "Raincoat", "Rainproof backpack cover");
    } else if (rainfall > 0) {
      console.log('rainfall > 0');
      items.push("Umbrella", "Water-resistant jacket");
    }
  } else {
    console.log('rainfall is not a number:', rainfall);
  }

  // Remove duplicates
  const result = Array.from(new Set(items));
  console.log('Final packing suggestions:', result);
  return result;
}

// Fetch UV Index and Rainfall from Open-Meteo (no API key required)
const fetchOpenMeteo = async (lat, lon) => {
  console.log('fetchOpenMeteo called with:', lat, lon);
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=uv_index,precipitation`;
    const response = await fetch(url);
    if (!response.ok) {
      console.log('fetchOpenMeteo response not ok');
      return { uvIndex: null, rainfall: null };
    }
    const data = await response.json();
    console.log('fetchOpenMeteo data:', data);

    // Get current hour index
    const now = new Date();
    const hourString = now.toISOString().slice(0, 13); // e.g. '2024-06-07T14'
    const hourIndex = data.hourly.time.findIndex(t => t.startsWith(hourString));

    const uvIndex = hourIndex !== -1 ? data.hourly.uv_index[hourIndex] : null;
    const rainfall = hourIndex !== -1 ? data.hourly.precipitation[hourIndex] : null;

    return { uvIndex, rainfall };
  } catch (err) {
    console.error('fetchOpenMeteo error:', err);
    return { uvIndex: null, rainfall: null };
  }
};

const WeatherApp = () => {
  console.log('WeatherApp component rendered');
  const { t } = useTranslation(); 
  const apiKey = "d1913710720b5095ce7b6763b3f46e71";
  const weatherUrl =
    "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
  const forecastUrl =
    "https://api.openweathermap.org/data/2.5/forecast?units=metric&q=";

  const [city1, setCity1] = useState("");
  const [city2, setCity2] = useState("");
  const [weather1, setWeather1] = useState(null);
  const [weather2, setWeather2] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("single");

  // Add this new function after the imports
  const getCoordinates = async (city) => {
    console.log('getCoordinates called with:', city);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${city},India`
      );
      const data = await response.json();
      console.log('getCoordinates data:', data);
      if (data.length > 0) {
        return { lat: data[0].lat, lon: data[0].lon };
      }
      return null;
    } catch (err) {
      console.error("Error fetching coordinates:", err);
      return null;
    }
  };

  // Modify the existing fetchWeather function
  const fetchWeather = async (city) => {
    console.log('fetchWeather called with:', city);
    try {
      // First try with city name
      const response = await fetch(`${weatherUrl}${city}&appid=${apiKey}`);
      console.log('fetchWeather response:', response);
      
      // If city not found, try with coordinates
      if (!response.ok) {
        const coords = await getCoordinates(city);
        if (!coords) {
          setWeather1(null); // Clear previous weather data
          console.log('fetchWeather: city not found');
          throw new Error(t("weather.cityNotFound"));
        }
        
        // Fetch weather using coordinates
        const coordResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?units=metric&lat=${coords.lat}&lon=${coords.lon}&appid=${apiKey}`
        );
        console.log('fetchWeather coordResponse:', coordResponse);
        
        if (!coordResponse.ok) {
          setWeather1(null); // Clear previous weather data
          console.log('fetchWeather: coordResponse not ok');
          throw new Error(t("weather.cityNotFound"));
        }
        
        // Get the weather data and override the name with the user's input
        const weatherData = await coordResponse.json();
        weatherData.name = city;
        console.log('fetchWeather weatherData (coords):', weatherData);
        return weatherData;
      }
      
      const weatherData = await response.json();
      console.log('fetchWeather weatherData:', weatherData);
      return weatherData;
    } catch (err) {
      setWeather1(null); // Clear previous weather data
      setError(err.message);
      console.error('fetchWeather error:', err);
      return null;
    }
  };

  // Update fetchForecast to accept city and optional coords
  const fetchForecast = async (city, coords = null) => {
    console.log('fetchForecast called with:', city, coords);
    try {
      let url;
      if (coords && coords.lat && coords.lon) {
        url = `https://api.openweathermap.org/data/2.5/forecast?units=metric&lat=${coords.lat}&lon=${coords.lon}&appid=${apiKey}`;
      } else {
        url = `${forecastUrl}${city}&appid=${apiKey}`;
      }
      const response = await fetch(url);
      console.log('fetchForecast url:', url);
      console.log('fetchForecast response:', response);
      if (!response.ok) throw new Error(t("weather.forecastUnavailable"));
      const data = await response.json();
      console.log('fetchForecast data:', data);

      // Group by day and take one reading per day
      const dailyForecast = data.list
        .filter((reading, index) => index % 8 === 0)
        .slice(0, 5);
      return dailyForecast;
    } catch (err) {
      console.error("Forecast error:", err);
      return null;
    }
  };

  // Get seasonal weather prediction
  const getSeasonalOutlook = (cityData) => {
    const month = new Date().getMonth();
    const temp = cityData.main.temp;
    const lat = cityData.coord?.lat;

    const isNorthern = lat > 0;

    let currentSeason, nextSeason;
    if (isNorthern) {
      if (month >= 2 && month <= 4) {
        currentSeason = t("weather.seasons.spring");
        nextSeason = t("weather.seasons.summer");
      } else if (month >= 5 && month <= 7) {
        currentSeason = t("weather.seasons.summer");
        nextSeason = t("weather.seasons.autumn");
      } else if (month >= 8 && month <= 10) {
        currentSeason = t("weather.seasons.autumn");
        nextSeason = t("weather.seasons.winter");
      } else {
        currentSeason = t("weather.seasons.winter");
        nextSeason = t("weather.seasons.spring");
      }
    } else {
      if (month >= 2 && month <= 4) {
        currentSeason = t("weather.seasons.autumn");
        nextSeason = t("weather.seasons.winter");
      } else if (month >= 5 && month <= 7) {
        currentSeason = t("weather.seasons.winter");
        nextSeason = t("weather.seasons.spring");
      } else if (month >= 8 && month <= 10) {
        currentSeason = t("weather.seasons.spring");
        nextSeason = t("weather.seasons.summer");
      } else {
        currentSeason = t("weather.seasons.summer");
        nextSeason = t("weather.seasons.autumn");
      }
    }

    let outlook = [];
    const currentTemp = Math.round(temp);

    if (
      currentSeason === t("weather.seasons.summer") ||
      (!isNorthern && month >= 11 && month <= 1)
    ) {
      outlook.push(
        t("weather.outlook", {
          season: currentSeason,
          description: t("weather.weatherConditions.warm", {
            temp: currentTemp,
          }),
        })
      );
      if (nextSeason === t("weather.seasons.autumn")) {
        outlook.push(
          t("weather.nextMonths", {
            description: t("weather.weatherConditions.coolingToAutumn", {
              min: currentTemp - 5,
              max: currentTemp - 10,
            }),
          })
        );
      } else {
        outlook.push(
          t("weather.nextMonths", {
            description: t("weather.weatherConditions.transitionToWinter", {
              min: currentTemp - 10,
              max: currentTemp - 15,
            }),
          })
        );
      }
    } else if (
      currentSeason === t("weather.seasons.winter") ||
      (!isNorthern && month >= 5 && month <= 7)
    ) {
      outlook.push(
        t("weather.outlook", {
          season: currentSeason,
          description: t("weather.weatherConditions.cold", {
            temp: currentTemp,
          }),
        })
      );
      if (nextSeason === t("weather.seasons.spring")) {
        outlook.push(
          t("weather.nextMonths", {
            description: t("weather.weatherConditions.warmingToSpring", {
              min: currentTemp + 5,
              max: currentTemp + 10,
            }),
          })
        );
      } else {
        outlook.push(
          t("weather.nextMonths", {
            description: t("weather.weatherConditions.transitionToSummer", {
              min: currentTemp + 10,
              max: currentTemp + 15,
            }),
          })
        );
      }
    } else {
      outlook.push(
        t("weather.outlook", {
          season: currentSeason,
          description: t("weather.weatherConditions.mild", {
            temp: currentTemp,
          }),
        })
      );
      if (nextSeason === t("weather.seasons.summer")) {
        outlook.push(
          t("weather.nextMonths", {
            description: t("weather.weatherConditions.warmingToSummer", {
              min: currentTemp + 5,
              max: currentTemp + 15,
            }),
          })
        );
      } else {
        outlook.push(
          t("weather.nextMonths", {
            description: t("weather.weatherConditions.coolingToWinter", {
              min: currentTemp - 5,
              max: currentTemp - 15,
            }),
          })
        );
      }
    }

    return outlook;
  };

  // Get packing suggestions based on temperature
  const getPackingSuggestions = (temp) => {
    if (temp < 5) {
      return [
        t("weather.packingItems.heavyCoat"),
        t("weather.packingItems.scarfGloves"),
        t("weather.packingItems.thermalUnderwear"),
        t("weather.packingItems.waterproofBoots"),
      ];
    } else if (temp < 15) {
      return [
        t("weather.packingItems.warmJacket"),
        t("weather.packingItems.layeredClothing"),
        t("weather.packingItems.lightScarf"),
        t("weather.packingItems.longPants"),
      ];
    } else if (temp < 25) {
      return [
        t("weather.packingItems.lightJacket"),
        t("weather.packingItems.tshirts"),
        t("weather.packingItems.comfortablePants"),
        t("weather.packingItems.walkingShoes"),
      ];
    } else {
      return [
        t("weather.packingItems.lightweightClothing"),
        t("weather.packingItems.shorts"),
        t("weather.packingItems.sunHat"),
        t("weather.packingItems.sunscreen"),
        t("weather.packingItems.sunglasses"),
      ];
    }
  };

  // Get best time to visit based on historical data
  const getBestTimeToVisit = (cityData) => {
    const month = new Date().getMonth();
    const temp = cityData.main.temp;
    const lat = cityData.coord?.lat;
    const isNorthern = lat > 0;

    let idealMonths = [];
    if (isNorthern) {
      if (temp < 10) {
        idealMonths = ["May", "June", "September"];
      } else if (temp > 28) {
        idealMonths = ["April-May", "September-October"];
      } else {
        idealMonths = ["April-June", "September-October"];
      }
    } else {
      if (temp < 10) {
        idealMonths = ["November-December", "March-April"];
      } else if (temp > 28) {
        idealMonths = ["March-April", "October-November"];
      } else {
        idealMonths = ["October-December", "March-May"];
      }
    }

    return idealMonths.length > 0
      ? t("weather.bestTimeToVisit", { months: idealMonths.join(" or ") })
      : t("weather.seasonalWeather");
  };

  const checkWeather = async () => {
    console.log('checkWeather called');
    if (!city1.trim()) return setError(t("weather.enterCity"));

    setLoading(true);
    setError("");

    try {
      let weatherData = await fetchWeather(city1);
      let forecastData = null;
      if (weatherData && weatherData.coord?.lat && weatherData.coord?.lon) {
        forecastData = await fetchForecast(city1, weatherData.coord);
      } else {
        forecastData = await fetchForecast(city1);
      }
      console.log('checkWeather weatherData:', weatherData);
      console.log('checkWeather forecastData:', forecastData);
      if (!weatherData) return;

      // Fetch UV index and rainfall using coordinates from weatherData (Open-Meteo)
      let uvIndex = null;
      let rainfall = null;
      if (weatherData.coord?.lat && weatherData.coord?.lon) {
        const meteo = await fetchOpenMeteo(weatherData.coord.lat, weatherData.coord.lon);
        uvIndex = meteo.uvIndex;
        rainfall = meteo.rainfall;
        console.log('checkWeather meteo:', meteo);
      }
      // After fetching weather and before setting state in checkWeather
      console.log('Fetched weatherData:', weatherData);
      console.log('Fetched forecastData:', forecastData);
      console.log('Fetched uvIndex:', uvIndex, 'Fetched rainfall:', rainfall);

      setWeather1({ ...weatherData, uvIndex, rainfall }); // Store uvIndex and rainfall in weather1
      setForecast(forecastData);
      setWeather2(null);
    } finally {
      setLoading(false);
    }
  };

  const compareWeather = async () => {
    console.log('compareWeather called');
    if (!city1.trim() || !city2.trim())
      return setError(t("weather.enterBothCities"));

    setLoading(true);
    setError("");

    try {
      const [data1, data2] = await Promise.all([
        fetchWeather(city1),
        fetchWeather(city2),
      ]);
      console.log('compareWeather data1:', data1);
      console.log('compareWeather data2:', data2);
      if (!data1 || !data2) return;

      setWeather1(data1);
      setWeather2(data2);
      setForecast(null);
    } finally {
      setLoading(false);
    }
  };

  // Get comparison recommendation
  const getComparisonRecommendation = (w1, w2) => {
    if (!w1 || !w2) return [];

    const tempDiff = w1.main.temp - w2.main.temp;
    const absTempDiff = Math.abs(tempDiff);
    const warmerCity = tempDiff > 0 ? w1 : w2;
    const coolerCity = tempDiff > 0 ? w2 : w1;
    const diff = Math.round(absTempDiff);

    let recommendations = [];

    if (absTempDiff < 3) {
      recommendations.push(t("weather.temperaturesSimilar"));
    } else {
      recommendations.push(
        t("weather.warmerThan", {
          city1: warmerCity.name,
          city2: coolerCity.name,
          diff,
        })
      );
    }

    const w1Season = getSeasonalOutlook(w1)[0];
    const w2Season = getSeasonalOutlook(w2)[0];

    if (w1Season !== w2Season) {
      recommendations.push(
        t("weather.seasonalComparison", {
          city1: w1.name,
          season1: w1Season.split(":")[0],
          city2: w2.name,
          season2: w2Season.split(":")[0],
        })
      );
    }

    if (tempDiff > 5) {
      recommendations.push(
        t("weather.preferWarmer", { city: warmerCity.name })
      );
    } else if (tempDiff < -5) {
      recommendations.push(
        t("weather.preferCooler", { city: coolerCity.name })
      );
    }

    return recommendations;
  };

  // Utility function to capitalize the first letter of a word
  const capitalizeFirst = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : str;

  // Before rendering packing recommendations in the component
  console.log('Packing input before render:', weather1?.main?.temp, weather1?.uvIndex, weather1?.rainfall);

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center text-white p-4 bg-fixed"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1948&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
        backgroundAttachment: "fixed",
      }}
    >
      {console.log('Rendering WeatherApp UI, weather1:', weather1, 'forecast:', forecast, 'error:', error)}
      <div className="backdrop-blur-sm bg-black bg-opacity-40 w-full min-h-screen fixed top-0 left-0 -z-10"></div>

      <div className="w-full max-w-4xl z-10 mt-10">
        <h2 className="text-4xl font-bold my-6 text-center drop-shadow-lg">
          {t("weather.title")}
        </h2>

        {/* Mode selector */}
        <div className="mb-6 flex flex-wrap justify-center gap-4">
          <button
            onClick={() => setMode("single")}
            className={`px-5 py-3 rounded-lg text-lg transition-all duration-300 ${
              mode === "single"
                ? "bg-blue-600 shadow-lg transform scale-105"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            {t("weather.singleCity")}
          </button>
          <button
            onClick={() => setMode("compare")}
            className={`px-5 py-3 rounded-lg text-lg transition-all duration-300 ${
              mode === "compare"
                ? "bg-blue-600 shadow-lg transform scale-105"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            {t("weather.compareCities")}
          </button>
        </div>

        {mode === "single" ? (
          <div className="w-full bg-gray-900 bg-opacity-80 p-6 rounded-lg shadow-lg backdrop-blur-sm">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <input
                type="text"
                placeholder={t("weather.enterCity")}
                value={city1}
                onChange={(e) => setCity1(e.target.value)}
                className="flex-1 px-4 py-3 rounded-lg text-black text-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                onClick={checkWeather}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg text-lg font-medium disabled:opacity-70 disabled:cursor-not-allowed transition-colors min-w-[200px]"
              >
                {loading ? t("weather.loading") : t("weather.checkWeather")}
              </button>
            </div>

            {error && (
              <div className="bg-red-900 bg-opacity-80 text-red-100 p-3 rounded-lg mb-4 flex items-center gap-2">
                <span className="text-xl">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {weather1 && !loading && (
              <div className="space-y-6">
                {/* Current weather */}
                <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-center md:text-left">
                      <h3 className="text-3xl font-bold">{capitalizeFirst(weather1.name)}</h3>
                      <p className="text-gray-300 text-lg">
                        {new Date().toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <p className="text-xl mt-2 capitalize">
                        {weather1.weather[0].description}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <img
                        src={`https://openweathermap.org/img/wn/${weather1.weather[0].icon}@4x.png`}
                        alt="weather icon"
                        className="w-24 h-24"
                      />
                      <p className="text-5xl font-bold">
                        {Math.round(weather1.main.temp)}°C
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div className="bg-gray-700 p-3 rounded-lg text-center">
                      <p className="text-gray-300">{t("weather.feelsLike")}</p>
                      <p className="text-xl font-semibold">
                        {Math.round(weather1.main.feels_like)}°C
                      </p>
                    </div>
                    <div className="bg-gray-700 p-3 rounded-lg text-center">
                      <p className="text-gray-300">{t("weather.humidity")}</p>
                      <p className="text-xl font-semibold">
                        {weather1.main.humidity}%
                      </p>
                    </div>
                    <div className="bg-gray-700 p-3 rounded-lg text-center">
                      <p className="text-gray-300">{t("weather.wind")}</p>
                      <p className="text-xl font-semibold">
                        {weather1.wind.speed} km/h
                      </p>
                    </div>
                    <div className="bg-gray-700 p-3 rounded-lg text-center">
                      <p className="text-gray-300">{t("weather.pressure")}</p>
                      <p className="text-xl font-semibold">
                        {weather1.main.pressure} hPa
                      </p>
                    </div>
                  </div>

                  {/* Travel recommendations section */}
                  <div className="mt-6 space-y-4">
                    <div className="p-4 bg-blue-900 bg-opacity-30 rounded-lg">
                      <h4 className="text-xl font-semibold mb-2">
                        {t("weather.seasonalOutlook")}
                      </h4>
                      {getSeasonalOutlook(weather1).map((line, i) => (
                        <p key={i} className="mb-1">
                          {line}
                        </p>
                      ))}
                    </div>

                    <div className="p-4 bg-green-900 bg-opacity-30 rounded-lg">
                      <h4 className="text-xl font-semibold mb-2">
                        {t("weather.travelRecommendations")}
                      </h4>
                      <p className="mb-2">{getBestTimeToVisit(weather1)}</p>
                      <div className="mt-2">
                        <p className="font-medium">
                          {t("weather.packingSuggestions")}:
                        </p>
                        <ul className="list-disc list-inside grid grid-cols-1 sm:grid-cols-2 gap-1 mt-1">
                          {getEvidenceBasedPacking({
                            temp: weather1.main.temp,
                            uvIndex: weather1.uvIndex,
                            rainfall: weather1.rainfall
                          }).map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5-day forecast */}
                {forecast && (
                  <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-2xl font-bold mb-4">
                      {t("weather.fiveDayForecast")}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                      {forecast.map((day, index) => (
                        <div
                          key={index}
                          className="bg-gray-700 p-4 rounded-lg text-center"
                        >
                          <p className="font-medium">
                            {new Date(day.dt * 1000).toLocaleDateString(
                              "en-US",
                              { weekday: "short" }
                            )}
                          </p>
                          <img
                            src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                            alt="weather icon"
                            className="mx-auto w-16 h-16"
                          />
                          <div className="flex justify-center gap-2 mt-2">
                            <span className="font-bold">
                              {Math.round(day.main.temp_max)}°
                            </span>
                            <span className="text-gray-300">
                              {Math.round(day.main.temp_min)}°
                            </span>
                          </div>
                          <p className="text-sm mt-1 capitalize">
                            {day.weather[0].description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="w-full bg-gray-900 bg-opacity-80 p-6 rounded-lg shadow-lg backdrop-blur-sm">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <input
                type="text"
                placeholder={t("weather.enterCity")}
                value={city1}
                onChange={(e) => setCity1(e.target.value)}
                className="flex-1 px-4 py-3 rounded-lg text-black text-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder={t("weather.enterCity")}
                value={city2}
                onChange={(e) => setCity2(e.target.value)}
                className="flex-1 px-4 py-3 rounded-lg text-black text-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                onClick={compareWeather}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg text-lg font-medium disabled:opacity-70 disabled:cursor-not-allowed transition-colors min-w-[200px]"
              >
                {loading ? t("weather.loading") : t("weather.compare")}
              </button>
            </div>

            {error && (
              <div className="bg-red-900 bg-opacity-80 text-red-100 p-3 rounded-lg mb-4 flex items-center gap-2">
                <span className="text-xl">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {weather1 && weather2 && !loading && (
              <div className="space-y-6">
                {/* Comparison recommendation */}
                <div className="bg-blue-900 bg-opacity-30 p-4 rounded-lg">
                  <h3 className="text-xl font-semibold mb-2">
                    {t("weather.comparisonSummary")}
                  </h3>
                  {getComparisonRecommendation(weather1, weather2).map(
                    (rec, i) => (
                      <p key={i} className="mb-1">
                        {rec}
                      </p>
                    )
                  )}

                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-blue-800 bg-opacity-50 p-3 rounded-lg">
                      <h4 className="font-medium mb-1">
                        🌤 {capitalizeFirst(weather1.name)} {t("weather.outlook").split(":")[0]}
                      </h4>
                      {getSeasonalOutlook(weather1).map((line, i) => (
                        <p key={i} className="text-sm">
                          {line}
                        </p>
                      ))}
                    </div>
                    <div className="bg-blue-800 bg-opacity-50 p-3 rounded-lg">
                      <h4 className="font-medium mb-1">
                        🌤 {capitalizeFirst(weather2.name)} {t("weather.outlook").split(":")[0]}
                      </h4>
                      {getSeasonalOutlook(weather2).map((line, i) => (
                        <p key={i} className="text-sm">
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Cities comparison */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {[weather1, weather2].map((city, index) => (
                    <div
                      key={index}
                      className="bg-gray-800 p-6 rounded-lg shadow-md"
                    >
                      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
                        <div>
                          <h3 className="text-2xl font-bold">{capitalizeFirst(city.name)}</h3>
                          <p className="text-gray-300">
                            {city.weather[0].description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <img
                            src={`https://openweathermap.org/img/wn/${city.weather[0].icon}@4x.png`}
                            alt="weather icon"
                            className="w-20 h-20"
                          />
                          <p className="text-4xl font-bold">
                            {Math.round(city.main.temp)}°C
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-700 p-2 rounded-lg text-center">
                          <p className="text-gray-300 text-sm">
                            {t("weather.feelsLike")}
                          </p>
                          <p className="text-lg font-semibold">
                            {Math.round(city.main.feels_like)}°C
                          </p>
                        </div>
                        <div className="bg-gray-700 p-2 rounded-lg text-center">
                          <p className="text-gray-300 text-sm">
                            {t("weather.humidity")}
                          </p>
                          <p className="text-lg font-semibold">
                            {city.main.humidity}%
                          </p>
                        </div>
                        <div className="bg-gray-700 p-2 rounded-lg text-center">
                          <p className="text-gray-300 text-sm">
                            {t("weather.wind")}
                          </p>
                          <p className="text-lg font-semibold">
                            {city.wind.speed} km/h
                          </p>
                        </div>
                        <div className="bg-gray-700 p-2 rounded-lg text-center">
                          <p className="text-gray-300 text-sm">
                            {t("weather.pressure")}
                          </p>
                          <p className="text-lg font-semibold">
                            {city.main.pressure} hPa
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 space-y-3">
                        <div className="bg-gray-700 p-3 rounded-lg">
                          <h4 className="font-semibold mb-1">
                            {t("weather.packingSuggestions")}
                          </h4>
                          <ul className="grid grid-cols-2 gap-1">
                            {getPackingSuggestions(city.main.temp).map(
                              (item, i) => (
                                <li
                                  key={i}
                                  className="text-sm flex items-center gap-1"
                                >
                                  <span>{item}</span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                        <div className="bg-green-900 bg-opacity-30 p-3 rounded-lg">
                          <h4 className="font-semibold mb-1">
                            {t("weather.bestTimeToVisit")}
                          </h4>
                          <p className="text-sm">{getBestTimeToVisit(city)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="mt-8 text-gray-300 text-sm text-center z-10">
        <p>{t("weather.weatherData")}</p>
        <p className="mt-1">{t("weather.seasonalEstimates")}</p>
      </footer>
    </div>
  );
};

export default WeatherApp;
