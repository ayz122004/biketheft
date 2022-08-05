import React, { useState } from "react";
import axios from "axios";

import "./App.css";
import ActivityItem from "./ActivityItem";

function App() {
  const [bikeStatus, setBikeStatus] = useState(""); // for getting indicator
  const [bikeTheftButton, setBikeTheftButton] = useState(""); // for posting data to toggle
  const [buttonStatus, setButtonStatus] = useState(""); // for getting current toggle status
  const [activityList, setActivityList] = useState([]); // for the Activity Log
  const [ledClass, setledClass] = useState("led-indicator-default");
  const [lastUpdated, setLastUpdated] = useState(""); // for  bikeStatus
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
        console.log("bikeStatus value: " + bikeStatus);
        let date = new Date().toLocaleString();
        setLastUpdated(date);
        if (response.data.last_value == 0) {
          setBikeStatus("Bike Is Secured");
          setledClass("led-indicator-green");
        } else {
          setBikeStatus("THEFT DETECTED!!!");
          setledClass("led-indicator-red");
          setTheftCounter(theftCounter + 1);
          console.log("theft counter: " + theftCounter);
        }
      });
  };

  return (
    <div className="App">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar--header">
          <h1>Bike Theft</h1>
          <h2>The smarter way to secure your bike</h2>
        </div>
        <div className="sidebar--group">
          <a href="https://cosmos.ucdavis.edu/">
            <div className="sidebar--card">
              <h1>UC Davis COSMOS</h1>
            </div>
          </a>
          <a href="https://cosmos.sf.ucdavis.edu/cluster-8-internet-things">
            <div className="sidebar--card">
              <h1>Cluster 8</h1>
              <p>IoT and Embedded Systems</p>
            </div>
          </a>
        </div>

        <div className="sidebar--group">
          <a href="https://io.adafruit.com/lmarielle/dashboards/biketheftdashboard">
            <div className="sidebar--card">
              <h1>Adafruit Dashboard</h1>
            </div>
          </a>
        </div>

        <div className="sidebar--group">
          <a href="https://github.com/ayz122004/biketheft">
            <div className="sidebar--card">
              <h1>{"Source Code"}</h1>
            </div>
          </a>
          <a href="https://github.com/ayz122004">
            <div className="sidebar--card">Angelina Z</div>
          </a>
          <a href="https://github.com/anikamadan">
            <div className="sidebar--card">Anika M</div>
          </a>
          <a href="https://github.com/goshefali">
            <div className="sidebar--card">Shefali G</div>
          </a>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="main-content--header">
          <h1>DASHBOARD</h1>
        </div>

        <div className="flex-row">
          <div className="main-content--card main-row-1" id="bike-lock">
            <button className="big" id="button1" onClick={getBikeTheftButton}>
              <h2>Toggle Lock</h2>
            </button>
            <p>click to toggle bike lock</p>
          </div>
          <div className="main-content--card main-row-1" id="bike-status">
            <div className="flex-row">
              <div id={ledClass} />
              <div className="flex-col">
                <p>{bikeStatus}</p>
                <button className="small" onClick={getBikeStatus}>
                  GET STATUS
                </button>
                <p>Last updated: {lastUpdated}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-row">
          <div className="main-content--card main-row-2" id="activity-log">
            <div className="flex-col">
              <h2>Activity Log</h2>
              <div className="scroll">
                {activityList.map((item, i) => (
                  <div key={i}>{item}</div>
                ))}
              </div>
            </div>
          </div>
          <div className="main-content--card main-row-2" id="theft-counter">
            <h2>{theftCounter}</h2>
            <p>total bike thefts detected</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
