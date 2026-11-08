import Joi from 'joi'
import { GET_DB } from '~/config/mongodb'
import { DATABASE_COLLECTIONS } from '~/utils/constants'

// Dinh nghia Collection Name
const COLLECTION_NAME = DATABASE_COLLECTIONS.APPEARANCE

const DEFAULT_APPEARANCE = {
  brandName: 'Mì Chũ Truyền Thống',
  logoText: 'MC',
  slogan: 'Hương vị thủ công từ đất Bắc Giang',
  primaryColor: '#D4A017',
  secondaryColor: '#2C1810',
  backgroundColor: '#FFFBEA',
  headingFont: 'Fraunces',
  bodyFont: 'Be Vietnam Pro',
  hotline: '0901 234 567',
  email: 'lienhe@michu.vn',
  address: 'Thị trấn Chũ, huyện Lục Ngạn, tỉnh Bắc Giang',
  announcementEnabled: true,
  announcementText: 'Miễn phí vận chuyển cho đơn hàng từ 300.000 đ',
  sections: {
    recommend: true,
    flashSale: true,
    bestSeller: true,
    reviews: true
  }
}

// Dinh nghia toan bo Schema cua Appearance Model
const COLLECTION_SCHEMA = Joi.object({
  brandName: Joi.string().required().default(DEFAULT_APPEARANCE.brandName),
  logoText: Joi.string().required().default(DEFAULT_APPEARANCE.logoText),
  slogan: Joi.string().optional().allow('').default(DEFAULT_APPEARANCE.slogan),
  primaryColor: Joi.string().default(DEFAULT_APPEARANCE.primaryColor),
  secondaryColor: Joi.string().default(DEFAULT_APPEARANCE.secondaryColor),
  backgroundColor: Joi.string().default(DEFAULT_APPEARANCE.backgroundColor),
  headingFont: Joi.string().default(DEFAULT_APPEARANCE.headingFont),
  bodyFont: Joi.string().default(DEFAULT_APPEARANCE.bodyFont),
  hotline: Joi.string().default(DEFAULT_APPEARANCE.hotline),
  email: Joi.string().default(DEFAULT_APPEARANCE.email),
  address: Joi.string().default(DEFAULT_APPEARANCE.address),
  announcementEnabled: Joi.boolean().default(DEFAULT_APPEARANCE.announcementEnabled),
  announcementText: Joi.string().default(DEFAULT_APPEARANCE.announcementText),
  sections: Joi.object({
    recommend: Joi.boolean().default(true),
    flashSale: Joi.boolean().default(true),
    bestSeller: Joi.boolean().default(true),
    reviews: Joi.boolean().default(true)
  }).default(DEFAULT_APPEARANCE.sections),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null)
})

const validateBeforeCreate = async (data) => {
  return await COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const getSettings = async () => {
  try {
    let settings = await GET_DB().collection(COLLECTION_NAME).findOne({})
    if (!settings) {
      const validData = await validateBeforeCreate(DEFAULT_APPEARANCE)
      await GET_DB().collection(COLLECTION_NAME).insertOne(validData)
      settings = await GET_DB().collection(COLLECTION_NAME).findOne({})
    }
    return settings
  } catch (error) {
    throw new Error(error)
  }
}

const updateSettings = async (updateData) => {
  try {
    const dataToUpdate = { ...updateData, updatedAt: Date.now() }
    delete dataToUpdate._id

    return await GET_DB().collection(COLLECTION_NAME).findOneAndUpdate(
      {},
      { $set: dataToUpdate },
      { upsert: true, returnDocument: 'after' }
    )
  } catch (error) {
    throw new Error(error)
  }
}

const resetSettings = async () => {
  try {
    const resetData = { ...DEFAULT_APPEARANCE, updatedAt: Date.now() }
    return await GET_DB().collection(COLLECTION_NAME).findOneAndUpdate(
      {},
      { $set: resetData },
      { upsert: true, returnDocument: 'after' }
    )
  } catch (error) {
    throw new Error(error)
  }
}

export const appearanceModel = {
  COLLECTION_NAME,
  COLLECTION_SCHEMA,
  getSettings,
  updateSettings,
  resetSettings,
  DEFAULT_APPEARANCE
}
