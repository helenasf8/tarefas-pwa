import { ref } from 'vue'

export function useReverseGeocoding() {
  const address = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function getAddress(latitude, longitude) {
    loading.value = true
    error.value = null
    address.value = null

    try {
      const url =
        `https://nominatim.openstreetmap.org/reverse` +
        `?format=jsonv2` +
        `&lat=${encodeURIComponent(latitude)}` +
        `&lon=${encodeURIComponent(longitude)}` +
        `&zoom=18` +
        `&addressdetails=1`

      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Não foi possível consultar o endereço.')
      }

      const data = await response.json()

      address.value = data.display_name || null

      return data
    } catch (err) {
      console.error('Erro ao obter endereço:', err)

      error.value =
        'Não foi possível obter o endereço. As coordenadas e o mapa continuarão disponíveis.'

      return null
    } finally {
      loading.value = false
    }
  }

  function clearAddress() {
    address.value = null
    error.value = null
  }

  return {
    address,
    loading,
    error,
    getAddress,
    clearAddress,
  }
}