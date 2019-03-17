// MAIN
import React, { Component } from "react";

// LIBRARY
import ReactSpeedometer from "react-d3-speedometer";
import { color } from "d3-color";
import { interpolateRgb } from "d3-interpolate";
import LiquidFillGauge from "react-liquid-gauge";

// CSS
import "./App.css";

const baseUrlApi = process.env.REACT_APP_API_URL || "localhost:4000";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      water: 0,
      wind: 0
    };
  }

  componentDidMount = () => {
    const socket = new WebSocket(`ws://${baseUrlApi}`);
    socket.addEventListener("open", function(event) {
      socket.send("ping");
      console.log("Socket connected");
    });

    let state = this.state;

    const setNewState = newState => {
      this.setState(newState);
    };

    socket.addEventListener("message", function(event) {
      const res = JSON.parse(event.data);
      const { message, status } = res;

      console.log(res);

      if (message === "data baru") {
        const { water, wind } = status;
        state.water = water;
        state.wind = wind;
        setNewState(state);
      }
    });
  };

  render() {
    const { water, wind } = this.state;

    const startColor = "#3498db"; // cornflowerblue
    const endColor = "#e74c3c"; // crimson
    const radius = 200;
    const interpolate = interpolateRgb(startColor, endColor);
    const fillColor = interpolate(water / 15);
    const gradientStops = [
      {
        key: "0%",
        stopColor: color(fillColor)
          .darker(0.5)
          .toString(),
        stopOpacity: 1,
        offset: "0%"
      },
      {
        key: "50%",
        stopColor: fillColor,
        stopOpacity: 0.75,
        offset: "50%"
      },
      {
        key: "100%",
        stopColor: color(fillColor)
          .brighter(0.5)
          .toString(),
        stopOpacity: 0.5,
        offset: "100%"
      }
    ];

    const warning = (value, tipe) => {
      if (tipe === "angin") {
        if (value <= 6) {
          return <h2>Aman</h2>;
        }
        if (value >= 7 && value <= 15) {
          return <h2>Siaga</h2>;
        }

        if (value > 15) {
          return <h2>Bahaya</h2>;
        }
      }
      if (tipe === "air") {
        if (value <= 5) {
          return <h2>Aman</h2>;
        }
        if (value >= 6 && value <= 8) {
          return <h2>Siaga</h2>;
        }

        if (value > 8) {
          return <h2>Bahaya</h2>;
        }
      }
      if (tipe) return <h2>warning tidak dikenal</h2>;
    };

    return (
      <div className="flex-container">
        <div>
          {warning(water, "air")}
          <center>
            <LiquidFillGauge
              style={{ margin: "0 auto" }}
              width={radius * 2}
              height={radius * 2}
              value={water}
              percent="%"
              textSize={1}
              textOffsetX={0}
              textOffsetY={0}
              textRenderer={props => {
                const value = Math.round(props.value);
                const radius = Math.min(props.height / 2, props.width / 2);
                const textPixels = (props.textSize * radius) / 2;
                const valueStyle = {
                  fontSize: textPixels
                };
                const percentStyle = {
                  fontSize: textPixels * 0.6
                };

                return (
                  <tspan>
                    <tspan className="value" style={valueStyle}>
                      {value}
                    </tspan>
                    <tspan style={percentStyle}>{props.percent}</tspan>
                  </tspan>
                );
              }}
              riseAnimation
              waveAnimation
              waveFrequency={2}
              waveAmplitude={1}
              gradient
              gradientStops={gradientStops}
              circleStyle={{
                fill: fillColor
              }}
              waveStyle={{
                fill: fillColor
              }}
              textStyle={{
                fill: color("#444").toString(),
                fontFamily: "Arial"
              }}
              waveTextStyle={{
                fill: color("#fff").toString(),
                fontFamily: "Arial"
              }}
              onClick={() => {
                this.setState({ value: Math.random() * 100 });
              }}
            />
            <h2>Air: {water} m </h2>
          </center>
        </div>
        <div>
          <center>
            {warning(water, "angin")}
            <ReactSpeedometer
              width={600}
              height={400}
              minValue={0}
              maxValue={100}
              startColor="#2ecc71"
              endColor="red"
              value={wind}
            />
            <h2>Angin: {wind}/mps</h2>
          </center>
        </div>
      </div>
    );
  }
}

export default App;
