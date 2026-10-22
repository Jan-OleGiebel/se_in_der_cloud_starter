<script setup lang="ts">
import { computed } from 'vue'
import type { CurrentWeatherData, CurrentWeatherUnits } from '~/types/weather'
import { getWeatherCondition } from '~/utils/weather'

const props = defineProps<{
  current: CurrentWeatherData
  units: CurrentWeatherUnits
}>()

const condition = computed(() => {
  return getWeatherCondition(props.current.weather_code, props.current.is_day)
})

const windLevel = computed(() => {
  const speed = props.current.wind_speed_10m
  if (speed < 5) return 'Calm'
  if (speed < 20) return 'Light breeze'
  if (speed < 40) return 'Moderate wind'
  if (speed < 60) return 'Strong breeze'
  return 'Gale / Storm'
})

const humidityLevel = computed(() => {
  const h = props.current.relative_humidity_2m
  if (h < 30) return 'Dry'
  if (h <= 65) return 'Comfortable'
  return 'Humid'
})

const pressureStatus = computed(() => {
  const p = props.current.surface_pressure
  if (p < 1005) return 'Low pressure'
  if (p <= 1020) return 'Standard'
  return 'High pressure'
})
</script>

<template>
  <div class="space-y-4">
    <!-- Main current weather banner -->
    <div class="relative overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent p-6 sm:p-8 backdrop-blur-md">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div class="flex items-start sm:items-center gap-5">
          <div class="p-4 rounded-2xl bg-white/80 dark:bg-neutral-800/80 shadow-sm border border-neutral-200/50 dark:border-neutral-700/50">
            <UIcon
              :name="condition.icon"
              class="w-12 h-12 text-primary"
            />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-semibold uppercase tracking-wider text-primary">Hamburg, Germany</span>
              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                Live Data
              </span>
            </div>
            <h2 class="text-4xl sm:text-5xl font-extrabold text-neutral-900 dark:text-neutral-50 tracking-tight mt-1">
              {{ current.temperature_2m }}{{ units.temperature_2m }}
            </h2>
            <p class="text-sm font-medium text-neutral-600 dark:text-neutral-300 mt-0.5">
              {{ condition.label }} • {{ condition.description }}
            </p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3 sm:border-l sm:border-neutral-200 sm:dark:border-neutral-800 sm:pl-6 text-sm">
          <div>
            <span class="text-xs text-neutral-500 dark:text-neutral-400">Feels Like</span>
            <p class="font-semibold text-neutral-800 dark:text-neutral-200">
              {{ current.apparent_temperature }}{{ units.apparent_temperature }}
            </p>
          </div>
          <div>
            <span class="text-xs text-neutral-500 dark:text-neutral-400">Precipitation</span>
            <p class="font-semibold text-neutral-800 dark:text-neutral-200">
              {{ current.precipitation }} {{ units.precipitation }}
            </p>
          </div>
          <div>
            <span class="text-xs text-neutral-500 dark:text-neutral-400">Wind</span>
            <p class="font-semibold text-neutral-800 dark:text-neutral-200">
              {{ current.wind_speed_10m }} {{ units.wind_speed_10m }}
            </p>
          </div>
          <div>
            <span class="text-xs text-neutral-500 dark:text-neutral-400">Humidity</span>
            <p class="font-semibold text-neutral-800 dark:text-neutral-200">
              {{ current.relative_humidity_2m }}{{ units.relative_humidity_2m }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Metric Cards Grid -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/60 p-4 backdrop-blur-sm">
        <div class="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
          <span class="text-xs font-medium">Feels Like</span>
          <UIcon
            name="i-lucide-thermometer-sun"
            class="w-4 h-4 text-emerald-500"
          />
        </div>
        <div class="mt-2 flex items-baseline gap-1">
          <span class="text-2xl font-bold text-neutral-900 dark:text-white">
            {{ current.apparent_temperature }}
          </span>
          <span class="text-sm font-medium text-neutral-500">{{ units.temperature_2m }}</span>
        </div>
        <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Actual: {{ current.temperature_2m }}{{ units.temperature_2m }}
        </p>
      </div>

      <div class="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/60 p-4 backdrop-blur-sm">
        <div class="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
          <span class="text-xs font-medium">Wind Condition</span>
          <UIcon
            name="i-lucide-wind"
            class="w-4 h-4 text-violet-500"
          />
        </div>
        <div class="mt-2 flex items-baseline gap-1">
          <span class="text-2xl font-bold text-neutral-900 dark:text-white">
            {{ current.wind_speed_10m }}
          </span>
          <span class="text-sm font-medium text-neutral-500">{{ units.wind_speed_10m }}</span>
        </div>
        <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          {{ windLevel }}
        </p>
      </div>

      <div class="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/60 p-4 backdrop-blur-sm">
        <div class="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
          <span class="text-xs font-medium">Humidity</span>
          <UIcon
            name="i-lucide-droplets"
            class="w-4 h-4 text-cyan-500"
          />
        </div>
        <div class="mt-2 flex items-baseline gap-1">
          <span class="text-2xl font-bold text-neutral-900 dark:text-white">
            {{ current.relative_humidity_2m }}
          </span>
          <span class="text-sm font-medium text-neutral-500">{{ units.relative_humidity_2m }}</span>
        </div>
        <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          {{ humidityLevel }}
        </p>
      </div>

      <div class="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/60 p-4 backdrop-blur-sm">
        <div class="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
          <span class="text-xs font-medium">Air Pressure</span>
          <UIcon
            name="i-lucide-gauge"
            class="w-4 h-4 text-amber-500"
          />
        </div>
        <div class="mt-2 flex items-baseline gap-1">
          <span class="text-2xl font-bold text-neutral-900 dark:text-white">
            {{ current.surface_pressure }}
          </span>
          <span class="text-sm font-medium text-neutral-500">{{ units.surface_pressure }}</span>
        </div>
        <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          {{ pressureStatus }}
        </p>
      </div>
    </div>
  </div>
</template>
