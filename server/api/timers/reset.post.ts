import { resetTimer } from './state'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const timerId = body.timerId
  
  if (!timerId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'timerId est requis'
    })
  }
  
  resetTimer(timerId)
  
  return { success: true }
})