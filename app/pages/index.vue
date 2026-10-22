<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import type { OpenMeteoResponse } from '~/types/weather'

// Open-Meteo forecast coordinates for Hamburg (53.5511° N, 9.9937° E)
const apiUrl = 'https://api.open-meteo.com/v1/forecast?latitude=53.5511&longitude=9.9937&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,surface_pressure&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Europe%2FBerlin&forecast_days=7'

const { data: weather, pending, error, refresh } = await useFetch<OpenMeteoResponse>(apiUrl, {
  lazy: false,
  server: false
})

const REFRESH_INTERVAL_SECONDS = 60
const lastUpdated = ref(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
const isAutoRefreshEnabled = ref(true)
const secondsUntilRefresh = ref(REFRESH_INTERVAL_SECONDS)
let timerId: ReturnType<typeof setInterval> | null = null

async function handleRefresh() {
  await refresh()
  lastUpdated.value = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  secondsUntilRefresh.value = REFRESH_INTERVAL_SECONDS
}

function toggleAutoRefresh() {
  isAutoRefreshEnabled.value = !isAutoRefreshEnabled.value
  if (isAutoRefreshEnabled.value) {
    secondsUntilRefresh.value = REFRESH_INTERVAL_SECONDS
  }
}

function tick() {
  if (!isAutoRefreshEnabled.value || pending.value) {
    return
  }

  if (secondsUntilRefresh.value > 1) {
    secondsUntilRefresh.value -= 1
  } else {
    secondsUntilRefresh.value = REFRESH_INTERVAL_SECONDS
    handleRefresh()
  }
}

function handleVisibilityChange() {
  if (document.visibilityState === 'visible' && isAutoRefreshEnabled.value) {
    handleRefresh()
  }
}

onMounted(() => {
  timerId = setInterval(tick, 1000)
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onBeforeUnmount(() => {
  if (timerId) {
    clearInterval(timerId)
    timerId = null
  }
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<template>
  <div class="py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
    <!-- Header & Hero -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-neutral-200/80 dark:border-neutral-800/80">
      <div>
        <div class="flex flex-wrap items-center gap-2 mb-2">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
            <span class="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Cloud Demo App
          </span>
          <span class="text-xs text-neutral-500 dark:text-neutral-400">
            Updated {{ lastUpdated }}
          </span>
          <span
            v-if="isAutoRefreshEnabled"
            class="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium"
          >
            <UIcon
              name="i-lucide-timer"
              class="w-3.5 h-3.5"
            />
            Auto-refresh in {{ secondsUntilRefresh }}s
          </span>
          <span
            v-else
            class="inline-flex items-center gap-1 text-xs text-neutral-400 dark:text-neutral-500 font-medium"
          >
            <UIcon
              name="i-lucide-pause-circle"
              class="w-3.5 h-3.5"
            />
            Auto-refresh paused
          </span>
        </div>
        <h1 class="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-neutral-50 tracking-tight">
          Hamburg Weather Dashboard
        </h1>
        <p class="text-neutral-600 dark:text-neutral-400 mt-1 max-w-2xl text-sm sm:text-base">
          Cloud app demo hosted in the IONOS-Cloud with real-time meteorological data, 24-hour trends with interactive line charts, 7-day projections, and comprehensive data points.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2.5">
        <UButton
          color="neutral"
          variant="subtle"
          size="sm"
          :icon="isAutoRefreshEnabled ? 'i-lucide-pause' : 'i-lucide-play'"
          class="cursor-pointer"
          @click="toggleAutoRefresh"
        >
          {{ isAutoRefreshEnabled ? 'Pause Auto-Refresh' : 'Resume Auto-Refresh' }}
        </UButton>

        <UButton
          color="neutral"
          variant="outline"
          size="sm"
          icon="i-lucide-refresh-cw"
          :loading="pending"
          class="cursor-pointer"
          @click="handleRefresh"
        >
          Refresh Now
        </UButton>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-if="error"
      class="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-6 text-center space-y-3"
    >
      <UIcon
        name="i-lucide-alert-triangle"
        class="w-10 h-10 text-red-500 mx-auto"
      />
      <h3 class="text-base font-semibold text-red-800 dark:text-red-300">
        Unable to load Hamburg weather data
      </h3>
      <p class="text-xs text-red-600 dark:text-red-400 max-w-md mx-auto">
        There was an error communicating with the Open-Meteo weather service. Please check network connectivity and try again.
      </p>
      <UButton
        color="error"
        variant="solid"
        size="sm"
        @click="handleRefresh"
      >
        Retry
      </UButton>
    </div>

    <!-- Loading Skeletons -->
    <div
      v-else-if="pending && !weather"
      class="space-y-6 animate-pulse"
    >
      <div class="h-44 rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          v-for="i in 4"
          :key="i"
          class="h-24 rounded-xl bg-neutral-200 dark:bg-neutral-800"
        />
      </div>
      <div class="h-80 rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
      <div class="h-64 rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
    </div>

    <!-- Main Content when data is ready -->
    <template v-else-if="weather">
      <!-- Current Weather Highlights & Metrics -->
      <section aria-label="Current Weather Metrics">
        <WeatherMetrics
          :current="weather.current"
          :units="weather.current_units"
        />
      </section>

      <!-- Forecast Line Chart Section -->
      <section aria-label="Interactive Weather Line Chart">
        <WeatherChart :hourly="weather.hourly" />
      </section>

      <!-- Multi-format Data Section: 7-Day & 24-Hour Views -->
      <section
        class="grid grid-cols-1 lg:grid-cols-3 gap-6"
        aria-label="Detailed Forecast Breakdowns"
      >
        <div class="lg:col-span-1">
          <WeatherDailyForecast :daily="weather.daily" />
        </div>
        <div class="lg:col-span-2">
          <WeatherHourlyTable :hourly="weather.hourly" />
        </div>
      </section>
    </template>
  </div>
</template>
