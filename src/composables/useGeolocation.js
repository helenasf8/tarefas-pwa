import { ref } from 'vue'

export function useGeolocation() {
  const location = ref(null)
  const loading = ref(false)
  const error = ref(null)

  function getErrorMessage(errorCode) {
    switch (errorCode) {
      case 1:
        return 'Permissão de localização negada. Ative a localização nas permissões do navegador e tente novamente.'

      case 2:
        return 'Não foi possível determinar sua localização. Verifique se o GPS ou a localização do dispositivo está ativada.'

      case 3:
        return 'A localização demorou muito para responder. Tente novamente.'

      default:
        return 'Não foi possível obter sua localização.'
    }
  }

  function getCurrentLocation() {
    return new Promise((resolve, reject) => {
      error.value = null

      if (!('geolocation' in navigator)) {
        error.value =
          'Seu navegador não oferece suporte à localização. A tarefa pode ser salva sem localização.'

        reject(new Error(error.value))
        return
      }

      loading.value = true

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          }

          location.value = coords
          loading.value = false

          resolve(coords)
        },
        (geoError) => {
          error.value = getErrorMessage(geoError.code)
          loading.value = false

          reject(geoError)
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        },
      )
    })
  }

  function clearLocation() {
    location.value = null
    error.value = null
  }

  return {
    location,
    loading,
    error,
    getCurrentLocation,
    clearLocation,
  }
}