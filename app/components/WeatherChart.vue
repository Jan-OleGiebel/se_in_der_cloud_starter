<script setup lang="ts">
import { computed, ref } from 'vue'
import type { HourlyWeatherData } from '~/types/weather'
import { formatTimeHour, formatDateShort } from '~/utils/weather'

const props = defineProps<{
  hourly: HourlyWeatherData
}>()

type MetricType = 'temperature' | 'precipitation' | 'wind' | 'humidity'

const selectedMetric = ref<MetricType>('temperature')
const timeRange = ref<number>(24) // 24, 48, or 168 (7 days)
const hoveredIndex = ref<number | null>(null)

const metrics = [
  { id: 'temperature', label: 'Temperature', unit: '°C', icon: 'i-lucide-thermometer', color: '#10b981', gradientFrom: 'rgba(16, 185, 129, 0.4)', gradientTo: 'rgba(16, 185, 129, 0.02)' },
  { id: 'precipitation', label: 'Precipitation Chance', unit: '%', icon: 'i-lucide-cloud-rain', color: '#3b82f6', gradientFrom: 'rgba(59, 130, 246, 0.4)', gradientTo: 'rgba(59, 130, 246, 0.02)' },
  { id: 'wind', label: 'Wind Speed', unit: 'km/h', icon: 'i-lucide-wind', color: '#8b5cf6', gradientFrom: 'rgba(139, 92, 246, 0.4)', gradientTo: 'rgba(139, 92, 246, 0.02)' },
  { id: 'humidity', label: 'Humidity', unit: '%', icon: 'i-lucide-droplets', color: '#06b6d4', gradientFrom: 'rgba(6, 182, 212, 0.4)', gradientTo: 'rgba(6, 182, 212, 0.02)' }
] as const

const currentMetricConfig = computed(() => {
  return metrics.find(m => m.id === selectedMetric.value) || metrics[0]
})

const dataset = computed(() => {
  const count = Math.min(timeRange.value, props.hourly.time.length)
  const times = props.hourly.time.slice(0, count)
  let rawValues: number[] = []

  switch (selectedMetric.value) {
    case 'temperature':
      rawValues = props.hourly.temperature_2m.slice(0, count)
      break
    case 'precipitation':
      rawValues = props.hourly.precipitation_probability.slice(0, count)
      break
    case 'wind':
      rawValues = props.hourly.wind_speed_10m.slice(0, count)
      break
    case 'humidity':
      rawValues = props.hourly.relative_humidity_2m.slice(0, count)
      break
  }

  return times.map((t, idx) => ({
    time: t,
    value: rawValues[idx] ?? 0,
    formattedHour: formatTimeHour(t),
    formattedDate: formatDateShort(t)
  }))
})

// Chart dimensions inside SVG coordinate space
const width = 800
const height = 260
const padding = { top: 25, right: 30, bottom: 40, left: 45 }

const chartValues = computed(() => dataset.value.map(d => d.value))

const minValue = computed(() => {
  if (!chartValues.value.length) return 0
  const min = Math.min(...chartValues.value)
  if (selectedMetric.value === 'precipitation' || selectedMetric.value === 'humidity') {
    return Math.max(0, Math.floor(min / 10) * 10 - 5)
  }
  return Math.floor(min) - 1
})

const maxValue = computed(() => {
  if (!chartValues.value.length) return 100
  const max = Math.max(...chartValues.value)
  if (selectedMetric.value === 'precipitation') {
    return Math.max(100, Math.ceil(max / 10) * 10)
  }
  return Math.ceil(max) + 1
})

const points = computed(() => {
  const data = dataset.value
  if (!data.length) return []
  const plotWidth = width - padding.left - padding.right
  const plotHeight = height - padding.top - padding.bottom
  const range = maxValue.value - minValue.value || 1

  return data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1 || 1)) * plotWidth
    const y = padding.top + plotHeight - ((d.value - minValue.value) / range) * plotHeight
    return {
      x,
      y,
      data: d,
      index: i
    }
  })
})

const svgPath = computed(() => {
  if (!points.value.length) return ''
  return points.value.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}` : `${acc} L ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`
  }, '')
})

const areaPath = computed(() => {
  if (!points.value.length) return ''
  const first = points.value[0]
  const last = points.value[points.value.length - 1]
  if (!first || !last) return ''
  const baseY = height - padding.bottom
  return `${svgPath.value} L ${last.x.toFixed(1)} ${baseY} L ${first.x.toFixed(1)} ${baseY} Z`
})

const yTicks = computed(() => {
  const ticksCount = 4
  const step = (maxValue.value - minValue.value) / ticksCount
  const plotHeight = height - padding.top - padding.bottom

  return Array.from({ length: ticksCount + 1 }, (_, i) => {
    const val = minValue.value + i * step
    const y = padding.top + plotHeight - (i / ticksCount) * plotHeight
    return {
      value: Math.round(val),
      y
    }
  })
})

const xTicks = computed(() => {
  const total = points.value.length
  if (total <= 1) return points.value
  const count = timeRange.value === 24 ? 6 : timeRange.value === 48 ? 6 : 7
  const interval = Math.floor(total / count)
  return points.value.filter((_, idx) => idx % interval === 0 || idx === total - 1)
})

const activePoint = computed(() => {
  if (hoveredIndex.value === null || !points.value[hoveredIndex.value]) {
    return null
  }
  return points.value[hoveredIndex.value]
})

function handleMouseMove(e: MouseEvent) {
  const svg = (e.currentTarget as SVGElement).getBoundingClientRect()
  const mouseX = ((e.clientX - svg.left) / svg.width) * width
  if (mouseX < padding.left || mouseX > width - padding.right || !points.value.length) {
    return
  }

  let closestIndex = 0
  let minDist = Number.POSITIVE_INFINITY
  points.value.forEach((pt, idx) => {
    const dist = Math.abs(pt.x - mouseX)
    if (dist < minDist) {
      minDist = dist
      closestIndex = idx
    }
  })
  hoveredIndex.value = closestIndex
}

function handleMouseLeave() {
  hoveredIndex.value = null
}
</script>

<template>
  <div class="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-md p-5 sm:p-6 shadow-sm">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div>
        <div class="flex items-center gap-2">
          <UIcon
            :name="currentMetricConfig.icon"
            class="w-5 h-5 text-primary"
          />
          <h3 class="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            Hamburg Forecast Trend (Line Chart)
          </h3>
        </div>
        <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Visualizing dynamic weather trends and variations over time
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <!-- Metric selector buttons -->
        <div class="inline-flex rounded-lg bg-neutral-100 dark:bg-neutral-800 p-1">
          <button
            v-for="m in metrics"
            :key="m.id"
            type="button"
            class="px-2.5 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5"
            :class="selectedMetric === m.id ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'"
            @click="selectedMetric = m.id"
          >
            <UIcon
              :name="m.icon"
              class="w-3.5 h-3.5"
            />
            <span class="hidden sm:inline">{{ m.label }}</span>
          </button>
        </div>

        <!-- Timeframe selector -->
        <div class="inline-flex rounded-lg bg-neutral-100 dark:bg-neutral-800 p-1">
          <button
            v-for="range in [24, 48, 168]"
            :key="range"
            type="button"
            class="px-2.5 py-1 text-xs font-medium rounded-md transition-all"
            :class="timeRange === range ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'"
            @click="timeRange = range"
          >
            {{ range === 168 ? '7 Days' : `${range}h` }}
          </button>
        </div>
      </div>
    </div>

    <!-- Chart Container -->
    <div class="relative w-full aspect-[21/9] min-h-[220px]">
      <svg
        :viewBox="`0 0 ${width} ${height}`"
        class="w-full h-full overflow-visible select-none cursor-crosshair"
        @mousemove="handleMouseMove"
        @mouseleave="handleMouseLeave"
      >
        <defs>
          <linearGradient
            id="chartGradient"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="0%"
              :stop-color="currentMetricConfig.color"
              stop-opacity="0.35"
            />
            <stop
              offset="100%"
              :stop-color="currentMetricConfig.color"
              stop-opacity="0.0"
            />
          </linearGradient>
        </defs>

        <!-- Grid lines and Y labels -->
        <g class="opacity-40">
          <g
            v-for="tick in yTicks"
            :key="tick.value"
          >
            <line
              :x1="padding.left"
              :y1="tick.y"
              :x2="width - padding.right"
              :y2="tick.y"
              stroke="currentColor"
              class="text-neutral-300 dark:text-neutral-700"
              stroke-dasharray="3 3"
              stroke-width="1"
            />
            <text
              :x="padding.left - 8"
              :y="tick.y + 4"
              text-anchor="end"
              class="text-[10px] fill-neutral-500 dark:fill-neutral-400 font-mono"
            >
              {{ tick.value }}{{ currentMetricConfig.unit }}
            </text>
          </g>
        </g>

        <!-- Area Fill -->
        <path
          :d="areaPath"
          fill="url(#chartGradient)"
        />

        <!-- Main Line -->
        <path
          :d="svgPath"
          fill="none"
          :stroke="currentMetricConfig.color"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        <!-- X Axis Labels -->
        <g>
          <text
            v-for="tick in xTicks"
            :key="tick.index"
            :x="tick.x"
            :y="height - 12"
            text-anchor="middle"
            class="text-[10px] fill-neutral-500 dark:fill-neutral-400 font-mono"
          >
            {{ timeRange > 24 ? tick.data.formattedDate : tick.data.formattedHour }}
          </text>
        </g>

        <!-- Hover Indicator & Vertical Crosshair -->
        <g v-if="activePoint">
          <line
            :x1="activePoint.x"
            :y1="padding.top"
            :x2="activePoint.x"
            :y2="height - padding.bottom"
            stroke="currentColor"
            class="text-neutral-400 dark:text-neutral-500"
            stroke-width="1.5"
            stroke-dasharray="2 2"
          />
          <circle
            :cx="activePoint.x"
            :cy="activePoint.y"
            r="6"
            :fill="currentMetricConfig.color"
            class="stroke-white dark:stroke-neutral-900 stroke-2 shadow-lg"
          />
        </g>
      </svg>

      <!-- Floating interactive tooltip -->
      <div
        v-if="activePoint"
        class="absolute pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3 px-3 py-2 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs shadow-xl z-20 flex flex-col items-center gap-0.5 min-w-[100px]"
        :style="{
          left: `${(activePoint.x / width) * 100}%`,
          top: `${(activePoint.y / height) * 100}%`
        }"
      >
        <span class="font-bold text-sm">
          {{ activePoint.data.value }} {{ currentMetricConfig.unit }}
        </span>
        <span class="text-[10px] opacity-75">
          {{ activePoint.data.formattedDate }} • {{ activePoint.data.formattedHour }}
        </span>
      </div>
    </div>
  </div>
</template>
