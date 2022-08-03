import "./App.css";
import axios from "axios";
import React, { useState } from "react";

function App() {
  const [bikeStatus, setBikeStatus] = useState("");
  const [bikeTheftButton, setBikeTheftButton] = React.useState(null);

  function getBikeTheftButton() {
    axios
      .post(
        "https://io.adafruit.com/api/v2/webhooks/feed/JCByxuvRpTcYKB9sdvcAuEyt1fGe",
        {
          value: "hello",
        }
      )
      .then((response) => {
        setBikeTheftButton(response.data);
      });
  }

  const getBikeStatus = () => {
    axios
      .get("https://io.adafruit.com/api/v2/lmarielle/feeds/bikestatus")
      .then((response) => {
        console.log(response);
        setBikeStatus("last value: " + response.data.last_value);
      });
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Dashboard</h1>
        <p>Bike Theft Detector</p>
        <button onClick={getBikeStatus}>Get Bike Status</button>
        {bikeStatus}
        <button onClick={getBikeTheftButton}>toggle bike theft button</button>
      </header>
    </div>
  );
}

export default App;
