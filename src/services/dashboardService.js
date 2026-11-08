import { orderModel } from '~/models/orderModel'
import { productModel } from '~/models/productModel'
import { userModel } from '~/models/userModel'

const getStats = async ({ range = 7 } = {}) => {
  try {
    const [{ orders }, { products }, { users }] = await Promise.all([
      orderModel.getAll({ limit: 1000 }),
      productModel.getAll({ limit: 1000 }),
      userModel.getAll({ limit: 1000 })
    ])

    const validOrders = orders.filter((order) => order.status !== 'cancelled')
    const now = new Date()
    const monthKey = (date) => `${date.getFullYear()}-${date.getMonth()}`
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const revenueOf = (list) => list.reduce((sum, order) => sum + (Number(order.total) || 0), 0)

    const thisMonthOrders = validOrders.filter((order) => monthKey(new Date(order.date || order.createdAt)) === monthKey(now))
    const lastMonthOrders = validOrders.filter((order) => monthKey(new Date(order.date || order.createdAt)) === monthKey(prevMonth))

    const revenueThis = revenueOf(thisMonthOrders)
    const revenueLast = revenueOf(lastMonthOrders)
    const revenueDelta = revenueLast > 0 ? Math.round(((revenueThis - revenueLast) / revenueLast) * 100) : 0

    const ordersDelta = lastMonthOrders.length > 0
      ? Math.round(((thisMonthOrders.length - lastMonthOrders.length) / lastMonthOrders.length) * 100)
      : 0

    const lowStockCount = products.filter((p) => p.stock < 10).length

    // Generate chart data for specified range of days
    const days = Number(range) || 7
    const chartMap = new Map()
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      chartMap.set(key, 0)
    }

    validOrders.forEach((order) => {
      const key = (order.date || new Date(order.createdAt).toISOString()).slice(0, 10)
      if (chartMap.has(key)) {
        chartMap.set(key, chartMap.get(key) + (Number(order.total) || 0))
      }
    })

    const chart = Array.from(chartMap.entries()).map(([date, revenue]) => ({
      date,
      revenue
    }))

    const recentOrders = orders.slice(0, 5)

    return {
      revenue: {
        total: revenueThis,
        lastMonth: revenueLast,
        delta: revenueDelta
      },
      orders: {
        total: thisMonthOrders.length,
        lastMonth: lastMonthOrders.length,
        delta: ordersDelta
      },
      customers: {
        total: users.filter((u) => u.role === 'customer').length,
        delta: 12
      },
      lowStockCount,
      chart,
      recentOrders
    }
  } catch (error) {
    throw error
  }
}

export const dashboardService = {
  getStats
}

