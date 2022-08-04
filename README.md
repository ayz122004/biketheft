# Bike Theft

The smarter way to secure your bike.

## About This Project

UC Davis has an active biking community, and bike thefts are unfortunately very common on campus. To solve this problem, we created Bike Theft™, a smart bike theft detector. It alerts the user to potential thefts, including but not limited to bike wheels, frames, and seats. Just attach the detector to the frame of your bike and set the bike to “locked” in the dashboard. Bike Theft will alert you if any suspicious or unexpected movements are detected.

## Usage

### Requirements

- TI MSP432 microcontroller
- Wifi module
- Booster pack
- Energia
- Adafruit IO

### Development

- Clone the repo
- `npm install`
- `npm start`
- Open `msp432.ino` with Energia and upload to the microcontroller.
- Modify `msp432.ino` and `App.js` with your own:
  - Wifi SSID/password
  - Adafruit username/API key
  - Adafruit feed API endpoints/webhook

## What's next for Bike Theft

See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests)

**Note: this is a one-way operation**