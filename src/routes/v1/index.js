import express from 'express'
import { StatusCodes } from '~/utils/constants'
import { productRoute } from './productRoute'
import { categoryRoute } from './categoryRoute'
import { orderRoute } from './orderRoute'
import { userRoute } from './userRoute'
import { voucherRoute } from './voucherRoute'
import { bannerRoute } from './bannerRoute'
import { appearanceRoute } from './appearanceRoute'
import { dashboardRoute } from './dashboardRoute'
import { blogRoute } from './blogRoute'
import { reviewRoute } from './reviewRoute'
import { seedRoute } from './seedRoute'
import { contactRoute } from './contactRoute'

const Router = express.Router()

/** Check APIs v1 status */
Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({ message: 'APIs V1 are ready to use!', timestamp: new Date() })
})

Router.use('/products', productRoute)
Router.use('/categories', categoryRoute)
Router.use('/orders', orderRoute)
Router.use('/users', userRoute)
Router.use('/vouchers', voucherRoute)
Router.use('/banners', bannerRoute)
Router.use('/appearance', appearanceRoute)
Router.use('/dashboard', dashboardRoute)
Router.use('/blogs', blogRoute)
Router.use('/reviews', reviewRoute)
Router.use('/seed', seedRoute)
Router.use('/contacts', contactRoute)

export const APIs_V1 = Router
