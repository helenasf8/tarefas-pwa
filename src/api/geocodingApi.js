import {
  extractAddressLabel,
  locationCacheKey,
} from '../utils/location.js'

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse'

const geocodingApi = {
  async reverse(latitude, longitude) {
    const cacheKey = locationCacheKey(latitude, longitude)

    if (!cacheKey) return null

    const cached = localStorage.getItem(cacheKey)

    if (cached) {
      try {
        return JSON.parse(cached)
      } catch {
        localStorage.removeItem(cacheKey)
      }
    }

    const params = new URLSearchParams({
      format: 'jsonv2',
      lat: String(latitude),
      lon: String(longitude),
      zoom: '18',
      addressdetails: '1',
      'accept-language': 'pt-BR',
    })

    const response = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Erro ao consultar o serviço de endereço.')
    }

    const data = await response.json()

    const result = {
      label: extractAddressLabel(data.address),
      displayName: data.display_name || null,
      address: data.address || {},
    }

    localStorage.setItem(cacheKey, JSON.stringify(result))

    return result
  },
}

export default geocodingApi