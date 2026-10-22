<script setup lang="ts">
import { computed } from 'vue'
import type { HourlyWeatherData } from '~/types/weather'
import { formatTimeHour, formatDateShort, getWeatherCondition } from '~/utils/weather'

const props = defineProps<{
  hourly: HourlyWeatherData
}>()

const items = computed(() => {
  const count = Math.min(24, props.hourly.time.length)
  return props.hourly.time.slice(0, count).map((t, idx) => {
    const temp = Math.round(props.hourly.temperature_2m[idx] ?? 0)
    const rain = props.hourly.precipitation_probability[idx] ?? 0
    const wind = Math.round(props.hourly.wind_speed_10m[idx] ?? 0)
    const humidity = Math.round(props.hourly.relative_humidity_2m[idx] ?? 0)
    const hourNum = new Date(t).getHours()
    const isDay = hourNum >= 6 && hourNum < 20 ? 1 : 0
    const fakeCode = rain > 60 ? 63 : rain > 30 ? 51 : 1
    const condition = getWeatherCondition(fakeCode, isDay)

    return {
      time: t,
      hour: formatTimeHour(t),
      date: formatDateShort(t),
      temp,
      rain,
      wind,
      humidity,
      condition
    }
  })
})
</script>

<template>
  <div class="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-md p-5 sm:p-6 shadow-sm">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <UIcon
          name="i-lucide-clock"
          class="w-5 h-5 text-primary"
        />
        <h3 class="text-base font-semibold text-neutral-900 dark:text-neutral-100">
          24-Hour Timeline & Detailed Data
        </h3>
      </div>
      <span class="text-xs text-neutral-500 dark:text-neutral-400">
        Scroll horizontally for hourly data
      </span>
    </div>

    <!-- Horizontal scrollable timeline -->
    <div class="overflow-x-auto pb-2 scrollbar-thin">
      <div class="flex gap-2 min-w-max">
        <div
          v-for="item in items"
          :key="item.time"
          class="flex flex-col items-center p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-700/50 w-24 text-center transition-all hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:scale-[1.02]"
        >
          <span class="text-xs font-semibold text-neutral-700 dark:text-neutral-300 font-mono">
            {{ item.hour }}
          </span>
          <span class="text-[10px] text-neutral-400 dark:text-neutral-500 mb-2">
            {{ item.date }}
          </span>

          <UIcon
            :name="item.condition.icon"
            class="w-6 h-6 text-primary my-1"
          />

          <span class="text-sm font-bold text-neutral-900 dark:text-white mt-1">
            {{ item.temp }}°C
          </span>

          <div class="mt-2 flex flex-col gap-1 w-full text-[11px]">
            <span
              class="flex items-center justify-center gap-0.5"
              :class="item.rain > 20 ? 'text-blue-500 font-medium' : 'text-neutral-400'"
            >
              <UIcon
                name="i-lucide-droplet"
                class="w-3 h-3"
              />
              {{ item.rain }}%
            </span>

            <span class="text-neutral-500 dark:text-neutral-400 flex items-center justify-center gap-0.5">
              <UIcon
                name="i-lucide-wind"
                class="w-3 h-3"
              />
              {{ item.wind }}km/h
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
