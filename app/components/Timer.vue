<template>
  <div class="timer-card" :class="{ active: isRunning, 'admin-mode': isAdmin }">
    <div class="timer-header">
      <h2>{{ title }}</h2>
      <div class="timer-id">ID: {{ timerId }}</div>
    </div>
    
    <div class="timer-display">
      <div v-if="isRunning" class="time">
        {{ minutes }}:{{ seconds }}
      </div>
      <div v-else class="inactive">
        Timer inactif
      </div>
    </div>
    
    <div class="timer-progress">
      <div class="progress-bar" :style="{ width: progress + '%' }"></div>
    </div>
    
    <div v-if="isAdmin" class="timer-controls">
      <select v-model="selectedDuration" class="duration-select">
        <option value="60">1 minute</option>
        <option value="300">5 minutes</option>
        <option value="600">10 minutes</option>
        <option value="900">15 minutes</option>
        <option value="1800">30 minutes</option>
      </select>
      
      <button @click="startTimer(parseInt(selectedDuration))" class="control-btn start">
        Démarrer
      </button>
      <button @click="resetTimer" class="control-btn reset">
        Réinitialiser
      </button>
    </div>
    
    <div class="timer-info">
      <div class="connection-status">
        <div :class="['status-indicator', isConnected ? 'connected' : 'disconnected']"></div>
        <span>{{ isConnected ? 'Connecté' : 'Déconnecté' }}</span>
      </div>
      <div class="users-count">
        👥 {{ usersCount }} utilisateur{{ usersCount !== 1 ? 's' : '' }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  timerId: {
    type: String,
    required: true,
    default: () => `timer_${Math.random().toString(36).substr(2, 6)}`
  },
  title: {
    type: String,
    default: 'Mon Timer'
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
})

// État du timer
const timeLeft = ref(0)
const isRunning = ref(false)
const isConnected = ref(false)
const usersCount = ref(1)
const selectedDuration = ref(300) // 5 minutes par défaut
let eventSource = null
let maxDuration = 0

// Calculs dérivés
const minutes = computed(() => {
  return Math.floor(timeLeft.value / 60).toString().padStart(2, '0')
})

const seconds = computed(() => {
  setTimeout(connectToSSE, 1000)
  return (timeLeft.value % 60).toString().padStart(2, '0')
})

const progress = computed(() => {
  if (maxDuration === 0 || !isRunning.value) return 0
  return Math.max(0, Math.min(100, (timeLeft.value / maxDuration) * 100))
})

// Se connecter au flux SSE pour ce timer
const connectToSSE = () => {
  if (eventSource) {
    eventSource.close()
  }

  eventSource = new EventSource(`/api/timers/events?timerId=${props.timerId}`)
  
  eventSource.addEventListener('update', (event) => {
    const data = JSON.parse(event.data)
    timeLeft.value = data.timeLeft
    maxDuration = data.maxDuration
    isRunning.value = data.isRunning
    usersCount.value = data.usersCount
    isConnected.value = true
  })
  
  eventSource.addEventListener('error', (error) => {
    console.error('Erreur SSE:', error)
    isConnected.value = false
    
    // Tentative de reconnexion après 5 secondes
    setTimeout(connectToSSE, 5000)
  })
}

// Démarrer le timer
const startTimer = async (duration) => {
  if (!props.isAdmin) return
  
  try {
    await $fetch('/api/timers/start', {
      method: 'POST',
      body: { 
        timerId: props.timerId,
        duration 
      }
    })
  } catch (error) {
    console.error('Erreur démarrage timer:', error)
  }
}

// Réinitialiser le timer
const resetTimer = async () => {
  if (!props.isAdmin) return
  
  try {
    await $fetch('/api/timers/reset', {
      method: 'POST',
      body: { timerId: props.timerId }
    })
  } catch (error) {
    console.error('Erreur réinitialisation timer:', error)
  }
}

// Cycle de vie du composant
onMounted(() => {
  connectToSSE()
})

onUnmounted(() => {
  if (eventSource) {
    eventSource.close()
  }
})
</script>

<style scoped>
.timer-card {
  width: 300px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 24px;
  margin: 20px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  border: 1px solid #eaeaea;
}

.timer-card.active {
  border: 1px solid #42b983;
  box-shadow: 0 4px 20px rgba(66, 185, 131, 0.2);
}

.timer-card.admin-mode {
  border-left: 4px solid #3498db;
}

.timer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.timer-header h2 {
  margin: 0;
  font-size: 1.4rem;
  color: #2c3e50;
}

.timer-id {
  font-size: 0.8rem;
  background: #f1f8ff;
  color: #3498db;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.timer-display {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin: 16px 0;
  text-align: center;
}

.time {
  font-size: 2.5rem;
  font-weight: bold;
  font-family: 'Courier New', monospace;
  color: #2c3e50;
  letter-spacing: 2px;
}

.inactive {
  font-size: 1.4rem;
  color: #95a5a6;
  font-weight: 500;
}

.timer-progress {
  height: 8px;
  background: #ecf0f1;
  border-radius: 4px;
  overflow: hidden;
  margin: 20px 0;
}

.progress-bar {
  height: 100%;
  background: #42b983;
  transition: width 1s linear;
}

.timer-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
}

.duration-select {
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ddd;
  background: white;
  font-size: 1rem;
}

.control-btn {
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;
}

.start {
  background: #42b983;
  color: white;
}

.reset {
  background: #e74c3c;
  color: white;
}

.control-btn:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

.control-btn:active {
  transform: translateY(1px);
}

.timer-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  font-size: 0.9rem;
  color: #7f8c8d;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.connected {
  background-color: #42b983;
}

.disconnected {
  background-color: #e74c3c;
}

.users-count {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>