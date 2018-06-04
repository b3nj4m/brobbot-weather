# brobbot-weather

A brobbot plugin for weather forecasts.

```
brobbot weather|forecast <query>
```

Searches MapBox for `query` and uses the result to query DarkSky for forecast data.

## Configuration (environment variables)

### MapBox Key

```bash
BROBBOT_WEATHER_MAPBOX_KEY=mysecretkey
```

Set the API key for MapBox
See https://www.mapbox.com/api-documentation/

### DarkSky Key

```bash
BROBBOT_WEATHER_DARKSKY_KEY=mysecretkey
```

Set the API key for DarkSky
See https://darksky.net/dev/docs
Powered by https://darksky.net/poweredby/

