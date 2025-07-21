// État global pour stocker tous les timers
const timersState: Record<string, any> = {}

// Fonction pour obtenir ou créer un timer
function getOrCreateTimer(timerId: string) {
  if (!timersState[timerId]) {
    timersState[timerId] = {
      endTime: null,
      isRunning: false,
      maxDuration: 0,
      clients: [],
      usersCount: 0
    }
  }
  return timersState[timerId]
}

// Fonction pour diffuser l'état à tous les clients d'un timer
export function broadcast(timerId: string) {
  const timer = getOrCreateTimer(timerId)
  
  const now = Date.now()
  const timeLeft = timer.isRunning && timer.endTime && timer.endTime > now
    ? Math.floor((timer.endTime - now) / 1000)
    : 0
  
  const isRunning = timer.isRunning && timer.endTime && timer.endTime > now
  
  const data = JSON.stringify({
    timeLeft,
    isRunning,
    maxDuration: timer.maxDuration,
    usersCount: timer.clients.length
  })
  
  timer.clients.forEach((client: any) => {
    client.res.write(`event: update\ndata: ${data}\n\n`)
  })
}

// Fonctions pour modifier l'état d'un timer
export function startTimer(timerId: string, duration: number) {
  const timer = getOrCreateTimer(timerId)
  timer.endTime = Date.now() + duration * 1000
  timer.isRunning = true
  timer.maxDuration = duration
  broadcast(timerId)
}

export function resetTimer(timerId: string) {
  const timer = getOrCreateTimer(timerId)
  timer.endTime = null
  timer.isRunning = false
  timer.maxDuration = 0
  broadcast(timerId)
}

// Gestion des clients
export function addClient(timerId: string, client: any) {
  const timer = getOrCreateTimer(timerId)
  
  // Ajouter le client
  timer.clients.push(client)
  
  // Envoyer l'état actuel
  const now = Date.now()
  const timeLeft = timer.isRunning && timer.endTime && timer.endTime > now
    ? Math.floor((timer.endTime - now) / 1000)
    : 0
  
  const isRunning = timer.isRunning && timer.endTime && timer.endTime > now
  
  const data = JSON.stringify({ 
    timeLeft, 
    isRunning, 
    maxDuration: timer.maxDuration,
    usersCount: timer.clients.length
  })
  
  client.res.write(`event: update\ndata: ${data}\n\n`)
  
  // Supprimer le client lorsqu'il se déconnecte
  client.req.on('close', () => {
    timer.clients = timer.clients.filter((c: any) => c !== client)
    broadcast(timerId)
  })
  
  // Mettre à jour le compteur d'utilisateurs
  broadcast(timerId)
}

// Vérifier périodiquement si le timer est terminé
setInterval(() => {
  const now = Date.now()
  
  for (const timerId in timersState) {
    const timer = timersState[timerId]
    
    if (timer.isRunning && timer.endTime && timer.endTime <= now) {
      timer.isRunning = false
      broadcast(timerId)
    }
  }
}, 1000)