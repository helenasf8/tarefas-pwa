<template>
  <form class="task-form" @submit.prevent="handleSubmit">
    <div class="task-row">
      <input
        v-model="newTask"
        type="text"
        placeholder="Nova tarefa..."
        class="task-input"
        required
      />

      <button
        type="submit"
        class="task-button"
        :disabled="uploading || locationLoading"
      >
        {{ editingTask ? 'Alterar' : 'Adicionar' }}
      </button>

      <button
        v-if="editingTask"
        type="button"
        class="task-button-cancel"
        @click="handleCancel"
      >
        Cancelar
      </button>
    </div>

    <!-- IMAGEM -->
    <div class="image-section">
      <img
        v-if="previewUrl || editingTask?.img_url"
        :src="previewUrl || editingTask?.img_url"
        class="image-preview"
        alt="Imagem da tarefa"
      />

      <label class="image-label" :class="{ disabled: uploading }">
        <span v-if="uploading" class="upload-status">
          Enviando...
        </span>

        <span v-else>
          {{
            previewUrl || editingTask?.img_url
              ? 'Trocar imagem'
              : 'Adicionar imagem'
          }}
        </span>

        <input
          type="file"
          accept="image/jpeg,image/png"
          capture="environment"
          class="image-input"
          :disabled="uploading"
          @change="handleImageChange"
        />
      </label>

      <p class="image-help">
        Em celular, o botão pode abrir a câmera.
      </p>
    </div>

    <!-- LOCALIZAÇÃO -->
    <div class="location-section">
      <div class="location-header">
        <div>
          <h3>Localização</h3>

          <p class="location-description">
            Opcional. Você pode salvar a tarefa sem informar sua localização.
          </p>
        </div>

        <button
          type="button"
          class="location-button"
          :disabled="locationLoading"
          @click="handleGetLocation"
        >
          {{
            locationLoading
              ? 'Obtendo localização...'
              : location
                ? 'Atualizar localização'
                : 'Usar localização atual'
          }}
        </button>
      </div>

      <div v-if="locationError" class="location-error">
        {{ locationError }}
      </div>

      <div v-if="location" class="location-info">
        <p>
          <strong>Latitude:</strong>
          {{ location.latitude.toFixed(6) }}
        </p>

        <p>
          <strong>Longitude:</strong>
          {{ location.longitude.toFixed(6) }}
        </p>

        <p>
          <strong>Precisão:</strong>
          {{ Math.round(location.accuracy) }} metros
        </p>

        <p v-if="addressLoading">
          <strong>Endereço:</strong>
          Consultando...
        </p>

        <p v-else-if="address">
          <strong>Endereço:</strong>
          {{ address }}
        </p>

        <p v-else-if="addressError" class="address-error">
          {{ addressError }}
        </p>

        <LocationMap
          :latitude="location.latitude"
          :longitude="location.longitude"
          :accuracy="location.accuracy"
        />

        <button
          type="button"
          class="remove-location-button"
          @click="clearLocation"
        >
          Remover localização
        </button>
      </div>

      <p v-if="!location && !locationError" class="location-help">
        A localização é opcional. Clique no botão acima para registrar
        latitude, longitude, precisão e endereço.
      </p>
    </div>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue'

import tasksApi from '../api/tasksApi.js'
import { useGeolocation } from '../composables/useGeolocation.js'
import { useReverseGeocoding } from '../composables/useReverseGeocoding.js'
import LocationMap from '../components/LocationMap.vue'

const props = defineProps({
  editingTask: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['add', 'update', 'cancel'])

const newTask = ref('')
const previewUrl = ref(null)
const imgAttachmentKey = ref(null)
const uploading = ref(false)

const {
  location,
  loading: locationLoading,
  error: locationError,
  getCurrentLocation,
  clearLocation: clearGeolocation,
} = useGeolocation()

const {
  address,
  loading: addressLoading,
  error: addressError,
  getAddress,
  clearAddress,
} = useReverseGeocoding()

watch(
  () => props.editingTask,
  (task) => {
    newTask.value = task ? task.title : ''

    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value)
    }

    previewUrl.value = null
    imgAttachmentKey.value = null

    clearLocation()
    clearAddress()

    if (task?.latitude != null && task?.longitude != null) {
      location.value = {
        latitude: Number(task.latitude),
        longitude: Number(task.longitude),
        accuracy: Number(task.accuracy || 0),
        timestamp: task.location_timestamp || Date.now(),
      }

      if (task.address) {
        address.value = task.address
      } else {
        getAddress(
          Number(task.latitude),
          Number(task.longitude),
        )
      }
    }
  },
  { immediate: true },
)

async function handleImageChange(event) {
  const file = event.target.files[0]

  if (!file) return

  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }

  previewUrl.value = URL.createObjectURL(file)
  uploading.value = true

  try {
    const response = await tasksApi.uploadImage(file)

    imgAttachmentKey.value = response.data.attachment_key
  } catch (err) {
    console.error('Erro ao fazer upload da imagem:', err)

    previewUrl.value = null
    imgAttachmentKey.value = null
  } finally {
    uploading.value = false
  }
}

async function handleGetLocation() {
  try {
    const currentLocation = await getCurrentLocation()

    await getAddress(
      currentLocation.latitude,
      currentLocation.longitude,
    )
  } catch (err) {
    console.error('Erro ao obter localização:', err)
  }
}

function clearLocation() {
  clearGeolocation()
  clearAddress()
}

function createLocationPayload() {
  if (!location.value) {
    return {
      latitude: null,
      longitude: null,
      accuracy: null,
      address: null,
      location_timestamp: null,
    }
  }

  return {
    latitude: location.value.latitude,
    longitude: location.value.longitude,
    accuracy: location.value.accuracy,
    address: address.value,
    location_timestamp: location.value.timestamp,
  }
}

function handleSubmit() {
  if (!newTask.value.trim()) return

  const payload = {
    title: newTask.value.trim(),
    imgAttachmentKey: imgAttachmentKey.value,
    ...createLocationPayload(),
  }

  if (props.editingTask) {
    emit('update', props.editingTask.id, payload)
  } else {
    emit('add', payload)
  }

  resetForm()
}

function resetForm() {
  newTask.value = ''

  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }

  previewUrl.value = null
  imgAttachmentKey.value = null

  clearLocation()
}

function handleCancel() {
  resetForm()
  emit('cancel')
}
</script>

<style scoped>
.task-form {
  margin-bottom: 24px;
}

.task-row {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.task-input {
  flex: 1;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;
}

.task-input:focus {
  border-color: #4a90d9;
}

.task-button {
  padding: 12px 20px;
  background-color: #4a90d9;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
}

.task-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.task-button-cancel {
  padding: 12px 16px;
  background-color: transparent;
  color: #666;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
}

.image-section {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  padding: 10px 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px dashed #ccc;
}

.image-preview {
  width: 56px;
  height: 56px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #ddd;
}

.image-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: white;
  border: 1.5px solid #4a90d9;
  color: #4a90d9;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
}

.image-label.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.image-input {
  display: none;
}

.upload-status {
  color: #888;
}

.image-help {
  width: 100%;
  font-size: 0.75rem;
  color: #999;
  margin: 0;
}

/* LOCALIZAÇÃO */

.location-section {
  margin-top: 16px;
  padding: 16px;
  background: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 10px;
}

.location-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.location-header h3 {
  font-size: 1rem;
  margin-bottom: 4px;
}

.location-description {
  color: #777;
  font-size: 0.8rem;
}

.location-button {
  width: 100%;
  padding: 11px;
  border: none;
  border-radius: 8px;
  background: #4a90d9;
  color: white;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
}

.location-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.location-error {
  margin-top: 12px;
  padding: 10px;
  border-radius: 7px;
  background: #fdecea;
  border: 1px solid #e74c3c;
  color: #b42318;
  font-size: 0.85rem;
}

.location-info {
  margin-top: 14px;
  padding: 12px;
  background: white;
  border-radius: 8px;
}

.location-info p {
  margin-bottom: 6px;
  font-size: 0.85rem;
  line-height: 1.4;
}

.address-error {
  color: #b42318;
}

.location-help {
  margin-top: 12px;
  color: #777;
  font-size: 0.8rem;
}

.remove-location-button {
  margin-top: 12px;
  padding: 8px 12px;
  background: transparent;
  color: #c0392b;
  border: 1px solid #e74c3c;
  border-radius: 6px;
  cursor: pointer;
}
</style>