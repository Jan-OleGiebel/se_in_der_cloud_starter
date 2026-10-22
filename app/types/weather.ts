export interface CurrentWeatherUnits {
  time: string
  interval: string
  temperature_2m: string
  relative_humidity_2m: string
  apparent_temperature: string
  is_day: string
  precipitation: string
  weather_code: string
  wind_speed_10m: string
  surface_pressure: string
}

export interface CurrentWeatherData {
  time: string
  interval: number
  temperature_2m: number
  relative_humidity_2m: number
  apparent_temperature: number
  is_day: number
  precipitation: number
  weather_code: number
  wind_speed_10m: number
  surface_pressure: number
}

export interface HourlyWeatherData {
  time: string[]
  temperature_2m: number[]
  relative_humidity_2m: number[]
  precipitation_probability: number[]
  wind_speed_10m: number[]
}

export interface DailyWeatherData {
  time: string[]
  weather_code: number[]
  temperature_2m_max: number[]
  temperature_2m_min: number[]
  precipitation_probability_max: number[]
}

export interface OpenMeteoResponse {
  latitude: number
  longitude: number
  generationtime_ms: number
  utc_offset_seconds: number
  timezone: string
  timezone_abbreviation: string
  elevation: number
  current_units: CurrentWeatherUnits
  current: CurrentWeatherData
  hourly: HourlyWeatherData
  daily: DailyWeatherData
}

export interface WeatherCondition {
  label: string
  icon: string
  description: string
}
