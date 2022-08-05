import React, { useState } from "react";

function ActivityItem(props) {
  return (
    <div
      style={{
        backgroundColor: "black",
        color: "lightgray",
        margin: "1vmin",
        padding: "1vmin",
        width: "45vw",
        borderRadius: "16px",
      }}
    >
      <div className="flex-row" style={{ justifyContent: "space-between" }}>
        <div>
          <span style={{ color: "gray" }}>Action:</span> {props.action}
        </div>
        <div>
          <span style={{ color: "gray" }}>Time:</span> {props.timestamp}
        </div>
      </div>
    </div>
  );
}
export default ActivityItem;
