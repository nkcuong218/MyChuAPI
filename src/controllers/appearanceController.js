import { appearanceService } from '~/services/appearanceService'
import { StatusCodes } from '~/utils/constants'

const getSettings = async (req, res, next) => {
  try {
    const settings = await appearanceService.getSettings()
    res.status(StatusCodes.OK).json(settings)
  } catch (error) {
    next(error)
  }
}

const updateSettings = async (req, res, next) => {
  try {
    const updated = await appearanceService.updateSettings(req.body)
    res.status(StatusCodes.OK).json(updated)
  } catch (error) {
    next(error)
  }
}

const resetSettings = async (req, res, next) => {
  try {
    const reset = await appearanceService.resetSettings()
    res.status(StatusCodes.OK).json(reset)
  } catch (error) {
    next(error)
  }
}

export const appearanceController = {
  getSettings,
  updateSettings,
  resetSettings
}

