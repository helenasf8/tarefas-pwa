import apiClient from './config.js'

const tasksApi = {
  getAll() {
    return apiClient.get('/tasks')
  },

  create(payload) {
    if (typeof payload === 'string') {
      return apiClient.post('/tasks', {
        title: payload,
      })
    }

    return apiClient.post('/tasks', {
      title: payload.title,

      img_attachment_key:
        payload.imgAttachmentKey ||
        payload.img_attachment_key ||
        null,

      latitude:
        payload.latitude ?? null,

      longitude:
        payload.longitude ?? null,

      accuracy:
        payload.accuracy ?? null,

      address:
        payload.address ?? null,

      location_timestamp:
        payload.location_timestamp ?? null,
    })
  },

  update(id, data) {
    return apiClient.patch(
      `/tasks/${id}`,
      data,
    )
  },

  remove(id) {
    return apiClient.delete(`/tasks/${id}`)
  },

  uploadImage(file, description = '') {
    const formData = new FormData()

    formData.append('file', file)

    if (description) {
      formData.append(
        'description',
        description,
      )
    }

    return apiClient.post(
      '/uploads/images/',
      formData,
      {
        headers: {
          'Content-Type':
            'multipart/form-data',
        },
      },
    )
  },
}

export default tasksApi