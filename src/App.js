import "./App.css";
import axios from "axios";
import React, { useState } from "react";

function App() {
  const [bikeStatus, setBikeStatus] = useState(""); // for getting indicator
  const [bikeTheftButton, setBikeTheftButton] = React.useState(null); //for posting data to toggle
  const [buttonStatus, setButtonStatus] = useState(""); //for getting current toggle status

  const getButtonStatus = () => {
    // GET current toggle status
    axios
      .get("https://io.adafruit.com/api/v2/lmarielle/feeds/biketheftbutton")
      .then((response) => {
        console.log(response);
        setButtonStatus(response.data.last_value);
      });
  };

  function getBikeTheftButton() {
    // POST new toggle data
    getButtonStatus();
    if (buttonStatus === "OFF") {
      axios
        .post(
          "https://io.adafruit.com/api/v2/webhooks/feed/jbaBsUEfpkLbXwEp6VFQfrjd89gV",
          {
            value: "ON",
          }
        )
        .then((response) => {
          console.log(response);
          setBikeTheftButton("In Use");
          document.getElementById("button1").innerHTML = bikeTheftButton;
          
        });
    } else if (buttonStatus === "ON") {
      axios
        .post(
          "https://io.adafruit.com/api/v2/webhooks/feed/jbaBsUEfpkLbXwEp6VFQfrjd89gV",
          {
            value: "OFF",
          }
        )
        .then((response) => {
          console.log(response);
          setBikeTheftButton("Locked");
          document.getElementById("button1").innerHTML = bikeTheftButton;
        });
    }
  }

  const getBikeStatus = () => {
    //GET current indicator status
    axios
      .get("https://io.adafruit.com/api/v2/lmarielle/feeds/bikestatus")
      .then((response) => {
        console.log(response);
        setBikeStatus("Most recent value: " + response.data.last_value);
      });
  };

  return (
    <div className="App">
      <header className="App-header">
        
          <h1>Bike Theft Detector Dashboard</h1>
          
          <div class="buttons">
            <div class="but">
          <button id="button1" class="button1" onClick={getBikeTheftButton}>toggle bike theft button</button>
          {"Button status: " + bikeTheftButton}
          </div>

          <div class="but">
          <button class="button2" onClick={getBikeStatus}>Get Bike Status</button>
          {bikeStatus}
          </div>
          </div>
  
      </header>
    </div>
  );
}

export default App;
