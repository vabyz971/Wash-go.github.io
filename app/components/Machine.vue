<template>
  <div>
    <div v-if="isRunning">
      <UCard variant="soft" class="ring-transparent h-full flex flex-col justify-center items-center"
        :ui="{ header: 'border-none pb-0', root: 'border-none' }">
        <template #header>
          <p class="font-sans text-2xl font-bold uppercase text-center">{{ props.title }} en marche</p>
        </template>
        <div class="font-sans text-8xl font-bold  text-center">
          {{ minutes }}:{{ seconds }}
        </div>
      </UCard>
    </div>
    <div v-else>
      <UCard variant="soft" class="ring-transparent flex flex-col justify-items-center items-center"
        :ui="{ header: 'border-none pb-0', body: 'border-none p-2', footer: 'pt-2', root: 'border-none' }">
        <template #header>
          <p class="font-sans text-3xl font-bold uppercase">{{ title }}</p>
        </template>

        <img :src=props.img alt="" @click="open = true">

        <template #footer>
          <p class="font-sans font-bold text-xl flex flex-row gap-1">
            {{ props.timer_label }} minutes
          </p>
        </template>
      </UCard>
    </div>

    <UModal v-model:open="open" :title=props.title :ui="{ footer: 'justify-end' }">

      <template #body>
        <p class="text-base">Voulez-vous lancer le minuteur ?</p>
        <p class="text-base">Une fois lancer, vous ne pourrez plus l'arrêter</p>
      </template>
      <template #footer="{ close }">
        <UButton label="Annuler" size="xl" color="neutral" variant="outline" @click="close" />
        <UButton label="Valider" size="xl" color="neutral" @click="startTimer(props.timer)" />
      </template>
    </UModal>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  img: {
    type: String,
    required: true,
  },
  timer: {
    type: Number,
    required: true,
  },
  timer_label: {
    type: Number,
    required: true,
  },
  timerId: {
    type: String,
    required: true,
  }
})

const toast = useToast()
const open = ref(false)
const timeLeft = ref(0)
const isRunning = ref(false)
const isConnected = ref(false)

let eventSource: EventSource | null = null


// Calcul des minutes et secondes
const minutes = computed(() => {
  return Math.floor(timeLeft.value / 60).toString().padStart(2, '0')
})

const seconds = computed(() => {
  setTimeout(connectToSSE, 1000)
  setTimeout(notification, 1000)
  return (timeLeft.value % 60).toString().padStart(2, '0')
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
    isRunning.value = data.isRunning
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
const startTimer = async (duration: number) => {
  open.value = false;
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

// Cycle de vie du composant
onMounted(() => {
  connectToSSE()
})

onUnmounted(() => {
  if (eventSource) {
    eventSource.close()
  }
})

const notification = () => {
  if (timeLeft.value == 0) {
    showToast()
    if ("Notification" in window) {
      Notification.requestPermission().then(function (permission) {
        if (permission === "granted") {
          var notification = new Notification(`Wash & Go`, {
            body: `${props.title} terminer`
          });

          notification.onclick = function () {
            // Action à effectuer lorsque l'utilisateur clique sur la notification
            window.focus(); // Ramène la fenêtre au premier plan
            this.close(); // Ferme la notification
          };
        }
      });
    } else {
      console.log("L'API Notifications n'est pas supportée par ce navigateur.");
    }
  }
}


function showToast() {
  toast.add({
    title: 'Information',
    description: `La ${props.title} a terminer`,
  })
}
</script>


<style scoped>
img {
  width: 15vh;
}
</style>