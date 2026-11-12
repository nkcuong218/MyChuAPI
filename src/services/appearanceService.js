import { appearanceModel } from '~/models/appearanceModel'
import { CACHE_PATTERNS, cacheGet, cacheSet, cacheDel } from '~/utils/cache'

const CACHE_TTL = 60 * 10 // 10 phut

const getSettings = async () => {
  const cached = await cacheGet(CACHE_PATTERNS.APPEARANCE)
  if (cached) return cached

  const settings = await appearanceModel.getSettings()
  await cacheSet(CACHE_PATTERNS.APPEARANCE, settings, CACHE_TTL)
  return settings
}

const updateSettings = async (reqBody) => {
  const updated = await appearanceModel.updateSettings(reqBody)
  await cacheDel(CACHE_PATTERNS.APPEARANCE)
  return updated
}

const resetSettings = async () => {
  const reset = await appearanceModel.resetSettings()
  await cacheDel(CACHE_PATTERNS.APPEARANCE)
  return reset
}

export const appearanceService = {
  getSettings,
  updateSettings,
  resetSettings
}
