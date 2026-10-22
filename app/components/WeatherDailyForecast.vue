<script setup lang="ts">
import { computed } from 'vue'
import type { DailyWeatherData } from '~/types/weather'
import { getWeatherCondition, formatDayName, formatDateShort } from '~/utils/weather'

const props = defineProps<{
  daily: DailyWeatherData
}>()

const days = computed(() => {
  return props.daily.time.map((time, idx) => {
    const code = props.daily.weather_code[idx] ?? 0
    const condition = getWeatherCondition(code, 1)
    return {
      time,
      dayName: formatDayName(time),
      shortDate: formatDateShort(time),
      minTemp: Math.round(props.daily.temperature_2m_min[idx] ?? 0),
      maxTemp: Math.round(props.daily.temperature_2m_max[idx] ?? 0),
      precipitationProb: props.daily.precipitation_probability_max[idx] ?? 0,
      condition
    }
  })
})

const overallMin = computed(() => {
  return Math.min(...props.daily.temperature_2m_min)
})

const overallMax = computed(() => {
  return Math.max(...props.daily.temperature_2m_max)
})

function getBarLeft(min: number): number {
  const range = (overallMax.value - overallMin.value) || 1
  return Math.max(0, Math.min(100, ((min - overallMin.value) / range) * 100))
}

function getBarWidth(min: number, max: number): number {
  const range = (overallMax.value - overallMin.value) || 1
  return Math.max(8, Math.min(100, ((max - min) / range) * 100))
}
</script>

<template>
  <div class="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-md p-5 sm:p-6 shadow-sm">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <UIcon
          name="i-lucide-calendar-days"
          class="w-5 h-5 text-primary"
        />
        <h3 class="text-base font-semibold text-neutral-900 dark:text-neutral-100">
          7-Day Forecast Overview
        </h3>
      </div>
      <span class="text-xs text-neutral-500 dark:text-neutral-400">
        Daily projections
      </span>
    </div>

    <div class="divide-y divide-neutral-100 dark:divide-neutral-800/80">
      <div
        v-for="day in days"
        :key="day.time"
        class="py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm"
      >
        <!-- Day & Date -->
        <div class="w-36 flex flex-col">
          <span class="font-semibold text-neutral-800 dark:text-neutral-200">
            {{ day.dayName }}
          </span>
          <span class="text-xs text-neutral-500 dark:text-neutral-400">
            {{ day.shortDate }}
          </span>
        </div>

        <!-- Condition & Rain probability -->
        <div class="flex items-center gap-3 min-w-[170px]">
          <div class="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800">
            <UIcon
              :name="day.condition.icon"
              class="w-5 h-5 text-primary"
            />
          </div>
          <div class="flex flex-col">
            <span class="text-xs font-medium text-neutral-700 dark:text-neutral-300">
              {{ day.condition.label }}
            </span>
            <span
              v-if="day.precipitationProb > 0"
              class="text-[11px] text-blue-600 dark:text-blue-400 flex items-center gap-0.5"
            >
              <UIcon
                name="i-lucide-umbrella"
                class="w-3 h-3"
              />
              {{ day.precipitationProb }}% rain
            </span>
            <span
              v-else
              class="text-[11px] text-neutral-400"
            >
              0% rain
            </span>
          </div>
        </div>

        <!-- Temperature Range & Scale Bar -->
        <div class="flex-1 max-w-xs flex items-center gap-3">
          <span class="text-xs font-mono font-medium text-neutral-500 dark:text-neutral-400 w-8 text-right">
            {{ day.minTemp }}°
          </span>

          <div class="flex-1 h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 relative overflow-hidden">
            <div
              class="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-teal-400 to-emerald-500 dark:from-teal-500 dark:to-emerald-400"
              :style="{
                left: `${getBarLeft(day.minTemp)}%`,
                width: `${getBarWidth(day.minTemp, day.maxTemp)}%`
              }"
            />
          </div>

          <span class="text-xs font-mono font-semibold text-neutral-800 dark:text-neutral-200 w-8">
            {{ day.maxTemp }}°
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
