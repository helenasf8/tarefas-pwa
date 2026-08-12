<template>
  <header class="app-header">
    <h1>Meus gestor de Tarefas</h1>
    <nav>
      <router-link to="/">Início</router-link>
      <router-link to="/about">Sobre</router-link>
      <button v-if="authStore.isAuthenticated" class="logout-btn" @click="handleLogout">
        Sair
      </button>
    </nav>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 2px solid #4a90d9;
  margin-bottom: 24px;
}

.app-header h1 {
  font-size: 1.4rem;
  color: #4a90d9;
}

nav {
  display: flex;
  gap: 16px;
  align-items: center;
}

nav a {
  text-decoration: none;
  color: #666;
  font-weight: 500;
  font-size: 0.9rem;
}

nav a.router-link-active {
  color: #4a90d9;
}

.logout-btn {
  background: rgb(255, 255, 255);
  border: 1px solid rgb(204, 202, 199);
  border-radius: 5px;
  font-weight: 500;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 3px 4px;
  color: #444343;
}

.logout-btn:hover {
  color: #e43f3f;
}
</style>
