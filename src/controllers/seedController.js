import { seedService } from '~/services/seedService'
import { StatusCodes } from '~/utils/constants'

const seed = async (req, res, next) => {
  try {
    const force = req.query.force === 'true'
    const result = await seedService.seedData(force)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

export const seedController = {
  seed
}

