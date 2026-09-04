<template>
  <div class="task-item" :class="{ done: task.done }">
    <img
      v-if="task.img_url"
      :src="task.img_url"
      class="task-thumbnail"
      alt="Imagem da tarefa"
    />

    <label class="task-label">
      <input
        type="checkbox"
        :checked="task.done"
        @change="$emit('toggle', task.id)"
      />

      <span class="task-content">
        <span class="task-title">
          {{ task.title }}
        </span>

        <span
          v-if="
            task.latitude != null &&
            task.longitude != null
          "
          class="location-badge"
        >
          📍 Localização salva
        </span>

        <span
          v-if="task.address"
          class="task-address"
        >
          {{ task.address }}
        </span>
      </span>
    </label>

    <div class="task-actions">
      <button
        class="task-edit"
        @click="$emit('edit', task)"
      >
        Editar
      </button>

      <button
        class="task-remove"
        @click="$emit('remove', task.id)"
      >
        Remover
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  task: {
    type: Object,
    required: true,
  },
})

defineEmits([
  'toggle',
  'remove',
  'edit',
])
</script>

<style scoped>
.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background-color: white;
  border-radius: 8px;
  margin-bottom: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  gap: 10px;
}

.task-thumbnail {
  width: 44px;
  height: 44px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #eee;
  flex-shrink: 0;
}

.task-item.done {
  opacity: 0.6;
}

.task-label {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  flex: 1;
}

.task-label input[type='checkbox'] {
  width: 20px;
  height: 20px;
  accent-color: #4a90d9;
  margin-top: 2px;
}

.task-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.task-title {
  font-size: 1rem;
}

.task-item.done .task-title {
  text-decoration: line-through;
  color: #999;
}

.location-badge {
  font-size: 0.75rem;
  color: #4a90d9;
  font-weight: 600;
}

.task-address {
  font-size: 0.75rem;
  color: #777;
  line-height: 1.3;
}

.task-actions {
  display: flex;
  gap: 4px;
  align-items: center;
}

.task-edit {
  background: none;
  border: none;
  color: #4a90d9;
  cursor: pointer;
  font-size: 0.85rem;
  padding: 4px 8px;
}

.task-edit:hover {
  text-decoration: underline;
}

.task-remove {
  background: none;
  border: none;
  color: #e74c3c;
  cursor: pointer;
  font-size: 0.85rem;
  padding: 4px 8px;
}

.task-remove:hover {
  text-decoration: underline;
}
</style>