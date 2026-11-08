import { appearanceModel } from '~/models/appearanceModel'

const getSettings = async () => {
  try {
    return await appearanceModel.getSettings()
  } catch (error) {
    throw error
  }
}

const updateSettings = async (reqBody) => {
  try {
    return await appearanceModel.updateSettings(reqBody)
  } catch (error) {
    throw error
  }
}

const resetSettings = async () => {
  try {
    return await appearanceModel.resetSettings()
  } catch (error) {
    throw error
  }
}

export const appearanceService = {
  getSettings,
  updateSettings,
  resetSettings
}

