import React, { useState } from "react";
import axios from "axios";

import "./App.css";
import ActivityItem from "./ActivityItem";
import bike from "./bike.png";

function App() {
  const [bikeStatus, setBikeStatus] = useState(""); // for getting indicator
  const [bikeTheftButton, setBikeTheftButton] = React.useState(null); // for posting data to toggle
  const [buttonStatus, setButtonStatus] = useState(""); // for getting current toggle status
  const [activityList, setActivityList] = useState([]); // for logging Lock/Unlock actions

  // Theft counter stuff
  const [theftCounter, setTheftCounter] = useState(0);

  const getButtonStatus = () => {
    // GET current toggle status
    axios
      .get("https://io.adafruit.com/api/v2/lmarielle/feeds/biketheftbutton")
      .then((response) => {
        console.log("get button status: " + response.data.last_value);
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
          { value: "ON" }
        )
        .then((response) => {
          console.log("POST getButton response: " + response.data.value);
          setBikeTheftButton("In Use");
          document.getElementById("button1").innerHTML = bikeTheftButton;

          //Activity Log stuff
          const date = new Date();
          let dateString = date.toLocaleString();
          let newActivityItem = (
            <ActivityItem action="Locked bike" timestamp={dateString} />
          );
          activityList.unshift(newActivityItem);
          setActivityList(activityList);
          console.log(activityList);
        });
      getBikeStatus();
    } else if (buttonStatus === "ON") {
      axios
        .post(
          "https://io.adafruit.com/api/v2/webhooks/feed/jbaBsUEfpkLbXwEp6VFQfrjd89gV",
          { value: "OFF" }
        )
        .then((response) => {
          console.log("POST getButton response: " + response.data.value);
          setBikeTheftButton("Locked");
          document.getElementById("button1").innerHTML = bikeTheftButton;

          //Activity Log stuff
          const date = new Date();
          let dateString = date.toLocaleString();
          let newActivityItem = (
            <ActivityItem action="Unlocked bike" timestamp={dateString} />
          );
          activityList.unshift(newActivityItem);
          setActivityList(activityList);
          console.log(activityList);
        });
      getBikeStatus();
    }
    getButtonStatus();
  }

  const getBikeStatus = () => {
    //GET current indicator status
    axios
      .get("https://io.adafruit.com/api/v2/lmarielle/feeds/bikestatus")
      .then((response) => {
        console.log("get bike status: " + response.data.last_value);
        if (response.data.last_value == 0) {
          setBikeStatus("Bike Is Secured");
        } else {
          setBikeStatus("THEFT DETECTED!!!");
          setTheftCounter(theftCounter + 1);
          console.log("theft counter: " + theftCounter);
        }
      });
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="outline">
          <div className="top">
            <div className="title">
              <h1>Bike Theft Detector Dashboard</h1>
              <h2>The smarter way to secure your bike.</h2>
            </div>

            <img src={bike} />
          </div>

          <div className="buttons">
            <div className="but">
              <h2>Toggle button to lock or unlock bike</h2>
              <button
                id="button1"
                className="button1"
                onClick={getBikeTheftButton}
              >
                toggle bike theft button
              </button>
            </div>

            <div className="but">
              <h2>Click button to view bike status</h2>
              <button className="button2" onClick={getBikeStatus}>
                Get Bike Status
              </button>
              {bikeStatus}
            </div>
          </div>
        </div>
        <div style={{ overflow: "scroll", height: "30vh" }}>
          {activityList.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </div>
        <div>{"theft counter: " + theftCounter}</div>
      </header>
    </div>
  );
}

export default App;
