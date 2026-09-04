export function extractAddressLabel(address = {}) {
  if (!address) return null

  const parts = [
    address.road,
    address.house_number,
    address.suburb,
    address.city,
    address.town,
    address.village,
  ].filter(Boolean)

  return parts.length > 0 ? parts.join(', ') : null
}

export function locationCacheKey(latitude, longitude) {
  if (latitude == null || longitude == null) return null

  return `location:${Number(latitude).toFixed(4)}:${Number(longitude).toFixed(4)}`
}

export function buildLocationPayload(location) {
  if (!location) return null

  return {
    latitude: Number(location.latitude),
    longitude: Number(location.longitude),
    geolocation_accuracy:
      location.accuracy != null ? Number(location.accuracy) : null,
    geolocation_timestamp: location.timestamp || null,
    location_label: location.label || null,
  }
}

export function classifyAccuracy(accuracy) {
  if (accuracy == null) return 'desconhecida'

  if (accuracy < 20) {
    return 'boa'
  }

  if (accuracy <= 100) {
    return 'moderada'
  }

  return 'baixa'
}

export function roundCoordinate(value, decimals = 2) {
  if (value == null) return null

  const factor = 10 ** decimals
  return Math.round(Number(value) * factor) / factor
}