<template>
  <div class="map-container">
    <div ref="mapElement" class="map"></div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

const props = defineProps({
  latitude: {
    type: Number,
    required: true,
  },

  longitude: {
    type: Number,
    required: true,
  },

  accuracy: {
    type: Number,
    default: 0,
  },
})

const mapElement = ref(null)

let map = null
let marker = null
let accuracyCircle = null

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

function updateMap() {
  if (!map) return

  const position = [props.latitude, props.longitude]

  map.setView(position, 16)

  if (marker) {
    marker.setLatLng(position)
  } else {
    marker = L.marker(position, {
      icon: defaultIcon,
    }).addTo(map)

    marker.bindPopup('Localização da tarefa')
  }

  if (accuracyCircle) {
    accuracyCircle.setLatLng(position)
    accuracyCircle.setRadius(props.accuracy || 0)
  } else if (props.accuracy > 0) {
    accuracyCircle = L.circle(position, {
      radius: props.accuracy,
      color: '#4a90d9',
      fillColor: '#4a90d9',
      fillOpacity: 0.15,
      weight: 2,
    }).addTo(map)
  }
}

onMounted(() => {
  const position = [props.latitude, props.longitude]

  map = L.map(mapElement.value).setView(position, 16)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(map)

  updateMap()
})

watch(
  () => [props.latitude, props.longitude, props.accuracy],
  () => {
    updateMap()
  },
)

onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<style scoped>
.map-container {
  width: 100%;
  margin-top: 12px;
}

.map {
  width: 100%;
  height: 280px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #ddd;
}
</style>