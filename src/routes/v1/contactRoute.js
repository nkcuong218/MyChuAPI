import express from 'express'
import { GET_DB } from '~/config/mongodb'
import { StatusCodes } from '~/utils/constants'

const Router = express.Router()

Router.post('/', async (req, res, next) => {
  try {
    const { name, email, phone, topic, message } = req.body
    if (!name || !email || !message) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Vui lòng điền đủ họ tên, email và nội dung!' })
    }

    const contactData = {
      name,
      email,
      phone: phone || '',
      topic: topic || 'Tư vấn sản phẩm',
      message,
      createdAt: new Date().toISOString()
    }

    try {
      const db = GET_DB()
      await db.collection('contacts').insertOne(contactData)
    } catch { }

    res.status(StatusCodes.CREATED).json({
      message: 'Gửi liên hệ thành công! Chúng tôi sẽ phản hồi sớm nhất.',
      data: contactData
    })
  } catch (error) {
    next(error)
  }
})

export const contactRoute = Router

