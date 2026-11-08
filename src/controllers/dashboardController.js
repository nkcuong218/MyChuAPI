import { dashboardService } from '~/services/dashboardService'
import { StatusCodes } from '~/utils/constants'

const getStats = async (req, res, next) => {
  try {
    const stats = await dashboardService.getStats(req.query)
    res.status(StatusCodes.OK).json(stats)
  } catch (error) {
    next(error)
  }
}

export const dashboardController = {
  getStats
}

