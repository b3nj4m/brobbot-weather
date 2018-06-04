// Configuration:
//   BROBBOT_WEATHER_MAPBOX_KEY=mysecretkey - Secret key for the mapbox api
//   BROBBOT_WEATHER_DARKSKY_KEY=mysecretkey - Secret key for the darksky api

const https = require('https');
const BROBBOT_WEATHER_MAPBOX_KEY = process.env.BROBBOT_WEATHER_MAPBOX_KEY || '';
const BROBBOT_WEATHER_DARKSKY_KEY = process.env.BROBBOT_WEATHER_DARKSKY_KEY || '';

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const d = [];

      if (res.statusCode !== 200) {
        reject(new Error(`Request failed with status ${res.statusCode}`));
      }

      res.on('data', (chunk) => d.push(chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(d.join('')));
        }
        catch (err) {
          reject(err);
        }
      });
    });
  });
}

function geoCode(query) {
  return Promise.resolve().then(() => {
    return get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${encodeURIComponent(BROBBOT_WEATHER_MAPBOX_KEY)}`)
      .then((data) => {
        const {center, text} = data.features.find((feature) => feature.place_type.includes('place'));
        return {center: center.reverse(), text};
      });
  });
}

function forecast(place) {
  return Promise.resolve().then(() => {
    return get(`https://api.darksky.net/forecast/${encodeURIComponent(BROBBOT_WEATHER_DARKSKY_KEY)}/${encodeURIComponent(place.center.join(','))}`)
      .then((forecast) => {
        return {place, forecast};
      });
  });
}

function forecastString(data) {
  const {currently, daily} = data.forecast;
  return `currently ${currently.summary} ${emojiName(currently.icon)} ${currently.temperature}°F; ${daily.summary} ${emojiName(daily.icon)}`;
}

const emojiIcons = {
  'clear-day': 'sun_with_face',
  'clear-night': 'full_moon_with_face',
  'rain': 'rain_cloud',
  'snow': 'snowman',
  'sleet': 'snow_cloud',
  'wind': 'wind_blowing_face',
  'fog': 'fog',
  'cloudy': 'cloud',
  'partly-cloudy-day': 'partly_cloudy',
  'partly-cloudy-night': 'partly_cloudy',
  'tornado': 'tornado',
  'thunderstorm': 'lightning_cloud_and_rain',
  'hail': 'snow_cloud'
};
function emojiName(iconName) {
  return emojiIcons[iconName] ? `:${emojiIcons[iconName]}:` : '';
}


module.exports = (robot) => {
  robot.helpCommand("brobbot weather `query`", "Get the weather forecast for `query`");

  robot.respond(/^(weather|forecast) (.+)/i, (msg) => {
    return geoCode(msg.match[2])
      .then(forecast)
      .then((data) => {
        msg.send(`Weather for ${data.place.text}: ${forecastString(data)}`);
      })
      .catch((err) => {
        msg.send(`No results for ${msg.match[2]} :(`);
        console.error(`brobbot-weather error: ${err}`);
      });
  });
};
