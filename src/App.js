import "./App.css";
import axios from "axios";
import React, { useState } from "react";
import bike from "./bike.png";


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
        <div class="outline">
        <div className="top">
          <div class="title">
          <h1>Bike Theft Detector Dashboard</h1>
        <h2>The smarter way to secure your bike.</h2>
          </div>
        
        {/* <div className="bike"></div> */}
        <img src={bike}/>
        </div>
          
          
          <div className="buttons">
            <div className="but">
              <h2>Toggle button to lock or unlock bike</h2>
          <button id="button1" className="button1" onClick={getBikeTheftButton}>toggle bike theft button</button>
          {/* {"Button status: " + bikeTheftButton} */}
          </div>

          <div className="but">
          <h2>Click button to veiw bike status</h2>
          <button className="button2" onClick={getBikeStatus}>Get Bike Status</button>
          {bikeStatus}
          </div>
          </div>
          </div>
      </header>
    </div>
  );
}

export default App;
