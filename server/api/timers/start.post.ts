import { startTimer } from './state'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const timerId = body.timerId
  const duration = parseInt(body.duration)
  
  if (!timerId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'timerId est requis'
    })
  }
  
  if (!duration || isNaN(duration) || duration <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Durée invalide'
    })
  }
  
  startTimer(timerId, duration)
  
  return { success: true }
})