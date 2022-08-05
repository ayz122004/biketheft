import React, { useState } from "react";

function ActivityItem(props) {
  return (
    <div
      style={{
        backgroundColor: "black",
        color: "white",
      }}
    >
      Activity Item:
      <ul>
        <li>Timestamp: {props.timestamp}</li>
        <li>Action: {props.action}</li>
      </ul>
    </div>
  );
}
export default ActivityItem;
