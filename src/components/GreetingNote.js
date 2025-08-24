import React, { useState } from "react";
import styled from "styled-components";
import { MDBIcon } from "mdb-react-ui-kit";

const GreetingNote = ({ userName }) => {
  const [weather, setWeather] = useState(null);

  // useEffect(() => {
  //   const fetchWeather = async () => {
  //     try {
  //       // Get user's location and fetch real weather data
  //       if (navigator.geolocation) {
  //         navigator.geolocation.getCurrentPosition(
  //           async (position) => {
  //             const { latitude, longitude } = position.coords;
  //             const response = await fetch(
  //               `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=YOUR_API_KEY`
  //             );
  //             const data = await response.json();
  //             setWeather(data);
  //           },
  //           async () => {
  //             // Fallback to a default location if geolocation fails
  //             const response = await fetch(
  //               "https://api.openweathermap.org/data/2.5/weather?q=New York&units=metric&appid=YOUR_API_KEY"
  //             );
  //             const data = await response.json();
  //             setWeather(data);
  //           }
  //         );
  //       } else {
  //         // Fallback for browsers that don't support geolocation
  //         const response = await fetch(
  //           "https://api.openweathermap.org/data/2.5/weather?q=New York&units=metric&appid=YOUR_API_KEY"
  //         );
  //         const data = await response.json();
  //         setWeather(data);
  //       }
  //     } catch (error) {
  //       console.log("Weather fetch error:", error);
  //       // Fallback weather data
  //       setWeather({
  //         weather: [{ main: "Clear", icon: "01d" }],
  //         main: { temp: 22 },
  //         name: "Current Location",
  //       });
  //     }
  //   };
  //   fetchWeather();
  // }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const getWeatherIcon = (weatherData) => {
    if (!weatherData || !weatherData.weather || !weatherData.weather[0]) {
      return "sun";
    }

    const weather = weatherData.weather[0];
    const iconCode = weather.icon;

    // Map OpenWeatherMap icon codes to FontAwesome icons
    switch (iconCode) {
      // Clear sky
      case "01d":
        return "sun";
      case "01n":
        return "moon";

      // Few clouds
      case "02d":
      case "02n":
        return "cloud-sun";

      // Scattered clouds
      case "03d":
      case "03n":
        return "cloud";

      // Broken clouds
      case "04d":
      case "04n":
        return "clouds";

      // Shower rain
      case "09d":
      case "09n":
        return "cloud-showers-heavy";

      // Rain
      case "10d":
        return "cloud-sun-rain";
      case "10n":
        return "cloud-moon-rain";

      // Thunderstorm
      case "11d":
      case "11n":
        return "bolt";

      // Snow
      case "13d":
      case "13n":
        return "snowflake";

      // Mist/Fog
      case "50d":
      case "50n":
        return "smog";

      default:
        return "sun";
    }
  };

  return (
    <WelcomeSection>
      <GreetingContainer>
        <GreetingIcon>
          <MDBIcon fas icon={weather ? getWeatherIcon(weather) : "sun"} />
        </GreetingIcon>
        <GreetingText>
          <Greeting>
            {getGreeting()} , {userName || "User"}!
          </Greeting>
        </GreetingText>
      </GreetingContainer>
    </WelcomeSection>
  );
};

export default GreetingNote;

const WelcomeSection = styled.div`
  padding: 20px 0;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 20px;
`;

const GreetingContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const GreetingIcon = styled.div`
  font-size: 24px;
  color: #4a90e2;
`;

const GreetingText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Greeting = styled.h1`
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: #333;
  font-family: Arial, sans-serif;
`;
