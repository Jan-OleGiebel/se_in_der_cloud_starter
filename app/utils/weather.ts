import type { WeatherCondition } from '~/types/weather'

export function getWeatherCondition(code: number, isDay: number = 1): WeatherCondition {
  switch (code) {
    case 0:
      return {
        label: 'Clear Sky',
        icon: isDay ? 'i-lucide-sun' : 'i-lucide-moon',
        description: 'Clear and sunny skies'
      }
    case 1:
      return {
        label: 'Mainly Clear',
        icon: isDay ? 'i-lucide-sun-medium' : 'i-lucide-moon-star',
        description: 'Mostly clear with minimal clouds'
      }
    case 2:
      return {
        label: 'Partly Cloudy',
        icon: isDay ? 'i-lucide-cloud-sun' : 'i-lucide-cloud-moon',
        description: 'Scattered clouds throughout the area'
      }
    case 3:
      return {
        label: 'Overcast',
        icon: 'i-lucide-cloud',
        description: 'Dense cloud cover'
      }
    case 45:
    case 48:
      return {
        label: 'Foggy',
        icon: 'i-lucide-cloud-fog',
        description: 'Fog with reduced visibility'
      }
    case 51:
    case 53:
    case 55:
      return {
        label: 'Drizzle',
        icon: 'i-lucide-cloud-drizzle',
        description: 'Light to moderate intermittent drizzle'
      }
    case 56:
    case 57:
      return {
        label: 'Freezing Drizzle',
        icon: 'i-lucide-cloud-snow',
        description: 'Freezing drizzle with icy conditions'
      }
    case 61:
    case 63:
    case 65:
      return {
        label: 'Rain',
        icon: 'i-lucide-cloud-rain',
        description: 'Continuous rainfall'
      }
    case 66:
    case 67:
      return {
        label: 'Freezing Rain',
        icon: 'i-lucide-cloud-snow',
        description: 'Rain freezing upon contact'
      }
    case 71:
    case 73:
    case 75:
    case 77:
      return {
        label: 'Snow',
        icon: 'i-lucide-snowflake',
        description: 'Snowfall accumulation'
      }
    case 80:
    case 81:
    case 82:
      return {
        label: 'Rain Showers',
        icon: 'i-lucide-cloud-rain-wind',
        description: 'Localized precipitation showers'
      }
    case 85:
    case 86:
      return {
        label: 'Snow Showers',
        icon: 'i-lucide-cloud-snow',
        description: 'Intermittent snow showers'
      }
    case 95:
      return {
        label: 'Thunderstorm',
        icon: 'i-lucide-cloud-lightning',
        description: 'Thunderstorm with lightning'
      }
    case 96:
    case 99:
      return {
        label: 'Severe Thunderstorm',
        icon: 'i-lucide-cloud-zap',
        description: 'Thunderstorm with potential hail'
      }
    default:
      return {
        label: 'Variable Weather',
        icon: 'i-lucide-cloud',
        description: 'Typical maritime conditions'
      }
  }
}

export function formatTimeHour(isoString: string): string {
  const date = new Date(isoString)
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

export function formatDateShort(isoString: string): string {
  const date = new Date(isoString)
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  }).format(date)
}

export function formatDayName(isoString: string): string {
  const date = new Date(isoString)
  const today = new Date()
  if (date.toDateString() === today.toDateString()) {
    return 'Today'
  }
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long'
  }).format(date)
}
