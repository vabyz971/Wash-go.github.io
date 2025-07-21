import { addClient } from './state'

export default defineEventHandler((event) => {
  // Récupérer l'ID du timer depuis les query params
  const timerId = getQuery(event).timerId as string
  
  if (!timerId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'timerId est requis'
    })
  }
  
  // Configurer les en-têtes SSE
  event.res.setHeader('Content-Type', 'text/event-stream')
  event.res.setHeader('Cache-Control', 'no-cache')
  event.res.setHeader('Connection', 'keep-alive')
  event.res.setHeader('Transfer-Encoding', 'chunked')
  event.res.flushHeaders()
  
  // Ajouter le client au timer spécifié
  addClient(timerId, {
    req: event.req,
    res: event.res
  })
})