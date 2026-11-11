import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { DATABASE_COLLECTIONS } from '~/utils/constants'

const initialCategories = [
  { id: 1, name: 'Mì Khô', count: 12, image: 'https://cdn.tgdd.vn/2022/01/CookRecipe/GalleryStep/hoan-thanh-hu-tieu-mi-kho.jpg' },
  { id: 2, name: 'Mì Tươi', count: 8, image: 'https://images.pexels.com/photos/36346857/pexels-photo-36346857/free-photo-of-c-n-c-nh-cac-s-i-mi-s-ng-d-c-s-p-x-p-theo-hinh-d-ng-tr-u-t-ng.jpeg?cs=tinysrgb&dpr=1&w=500' },
  { id: 3, name: 'Bánh Đa', count: 6, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9yd6JdJX-FxVSuAxGfaWyGRr0fXh9C3SclcWdmoUSpQ&s=10' },
  { id: 4, name: 'Combo', count: 5, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT5o1vHZyHr7_uJyshCJQSbDXhRH-fQwRZX5WHzK31PUNEoKUqxafGU3oY&s=10' }
]

const initialProducts = [
  { id: 1, sku: 'MC-001', name: 'Mì Chũ Khô Truyền Thống', description: 'Sợi mì dai mềm, giữ trọn hương vị gạo quê Bắc Giang.', category: 'Mì Khô', rate: 5, rateNum: 2, price: 45000, originalPrice: 52000, sold: 342, stock: 120, visible: true, image: 'https://cdn.tgdd.vn/2022/01/CookRecipe/GalleryStep/hoan-thanh-hu-tieu-mi-kho.jpg' },
  { id: 2, sku: 'MC-002', name: 'Mì Chũ Tươi Nguyên Chất 300g', description: 'Mì tươi làm từ gạo nguyên chất, thơm ngon cho bữa ăn gia đình.', category: 'Mì Tươi', rate: 4, rateNum: 1, price: 32000, sold: 89, stock: 64, visible: true, image: 'https://images.pexels.com/photos/36346857/pexels-photo-36346857/free-photo-of-c-n-c-nh-cac-s-i-mi-s-ng-d-c-s-p-x-p-theo-hinh-d-ng-tr-u-t-ng.jpeg?cs=tinysrgb&dpr=1&w=500' },
  { id: 3, sku: 'MC-003', name: 'Bánh Đa Gạo Lứt Bắc Giang 400g', description: 'Bánh đa gạo lứt truyền thống, thơm bùi và dễ chế biến.', category: 'Bánh Đa', rate: 5, rateNum: 0, price: 38000, sold: 215, stock: 8, visible: true, image: 'https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/banh_da_do_4_da1b5bf259.jpg' },
  { id: 4, sku: 'MC-004', name: 'Combo Gia Đình - 5 gói Mì Chũ Khô', description: 'Combo tiết kiệm cho gia đình, đủ dùng cho những bữa ăn ngon.', category: 'Combo', rate: 5, rateNum: 0, price: 195000, originalPrice: 230000, sold: 128, stock: 25, visible: true, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT5o1vHZyHr7_uJyshCJQSbDXhRH-fQwRZX5WHzK31PUNEoKUqxafGU3oY&s=10' },
  { id: 5, sku: 'MC-005', name: 'Mì Chũ Rau Củ Tự Nhiên 300g', description: 'Sợi mì mềm dai, màu sắc tự nhiên từ rau củ.', category: 'Mì Khô', rate: 5, rateNum: 0, price: 52000, sold: 76, stock: 40, visible: true, image: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=600&auto=format&fit=crop' },
  { id: 6, sku: 'MC-006', name: 'Mì Chũ Tươi Đặc Biệt 500g', description: 'Mì tươi làm từ gạo nguyên chất, phù hợp cho cả gia đình.', category: 'Mì Tươi', rate: 5, rateNum: 0, price: 48000, originalPrice: 55000, sold: 134, stock: 5, visible: true, image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop' },
  { id: 7, sku: 'MC-007', name: 'Bánh Đa Đỏ Bắc Giang 300g', description: 'Bánh đa truyền thống, thơm bùi và dễ chế biến.', category: 'Bánh Đa', rate: 5, rateNum: 0, price: 35000, sold: 58, stock: 70, visible: true, image: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=600&auto=format&fit=crop' },
  { id: 8, sku: 'MC-008', name: 'Combo Quà Quê Bắc Giang', description: 'Set quà gồm mì Chũ và bánh đa, thích hợp làm quà biếu.', category: 'Combo', rate: 5, rateNum: 0, price: 225000, sold: 92, stock: 18, visible: true, image: 'https://images.unsplash.com/photo-1556761223-4c4282c73f77?w=600&auto=format&fit=crop' },
  { id: 9, sku: 'MC-009', name: 'Mì Chũ Ngũ Sắc 300g', description: 'Mì Chũ nhiều màu tự nhiên từ rau củ, vừa ngon vừa bắt mắt.', category: 'Mì Khô', rate: 5, rateNum: 0, price: 58000, originalPrice: 68000, sold: 67, stock: 33, visible: true, image: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=600&auto=format&fit=crop' },
  { id: 10, sku: 'MC-010', name: 'Mì Chũ Tươi Rau Củ 500g', description: 'Mì tươi mềm dai kết hợp vị rau củ, phù hợp cho các món nước.', category: 'Mì Tươi', rate: 5, rateNum: 0, price: 55000, sold: 45, stock: 0, visible: false, image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&auto=format&fit=crop' },
  { id: 11, sku: 'MC-011', name: 'Bánh Đa Gạo Truyền Thống 500g', description: 'Bánh đa sợi mỏng, thơm mùi gạo, dùng ngon trong nhiều món ăn.', category: 'Bánh Đa', rate: 5, rateNum: 0, price: 42000, originalPrice: 50000, sold: 81, stock: 52, visible: true, image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=600&auto=format&fit=crop' },
  { id: 12, sku: 'MC-012', name: 'Combo Đặc Sản Bắc Giang', description: 'Hộp quà gồm mì Chũ, mì tươi và bánh đa đặc sản địa phương.', category: 'Combo', rate: 5, rateNum: 0, price: 285000, sold: 53, stock: 12, visible: true, image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop' }
]

const initialUsers = [
  { id: 1, name: 'Quản trị viên', email: 'admin@michu.vn', phone: '0900 000 001', role: 'admin', status: 'active', joinedAt: '2025-01-05', address: 'Thị trấn Chũ, Lục Ngạn, Bắc Giang', password: 'admin' },
  { id: 2, name: 'Nguyễn Văn A', email: 'nguyenvana@example.com', phone: '0901 234 567', role: 'customer', status: 'active', joinedAt: '2025-06-12', address: 'Số 12, đường Lê Lợi, Phường Hoàng Văn Thụ, Bắc Giang', password: 'password' },
  { id: 3, name: 'Trần Thị Bình', email: 'binh.tran@example.com', phone: '0912 345 678', role: 'customer', status: 'active', joinedAt: '2025-08-03', address: 'Tầng 3, tòa nhà ABC, Cầu Giấy, Hà Nội', password: 'password' },
  { id: 4, name: 'Lê Minh Châu', email: 'chau.le@example.com', phone: '0987 654 321', role: 'customer', status: 'active', joinedAt: '2025-09-21', address: 'Ngõ 45, Đống Đa, Hà Nội', password: 'password' },
  { id: 5, name: 'Phạm Quốc Dũng', email: 'dung.pham@example.com', phone: '0934 111 222', role: 'customer', status: 'active', joinedAt: '2025-11-02', address: 'Quận 3, TP. Hồ Chí Minh', password: 'password' },
  { id: 6, name: 'Hoàng Thu Hà', email: 'ha.hoang@example.com', phone: '0975 888 999', role: 'customer', status: 'locked', joinedAt: '2026-01-15', address: 'Lê Chân, Hải Phòng', password: 'password' },
  { id: 7, name: 'Vũ Đức Khang', email: 'khang.vu@example.com', phone: '0868 333 444', role: 'customer', status: 'active', joinedAt: '2026-03-08', address: 'Hải Châu, Đà Nẵng', password: 'password' },
  { id: 8, name: 'Đỗ Ngọc Lan', email: 'lan.do@example.com', phone: '0399 555 666', role: 'customer', status: 'active', joinedAt: '2026-05-19', address: 'TP. Bắc Ninh, Bắc Ninh', password: 'password' },
  { id: 9, name: 'Bùi Thanh Mai', email: 'mai.bui@example.com', phone: '0356 777 888', role: 'customer', status: 'active', joinedAt: '2026-07-27', address: 'TP. Thái Nguyên, Thái Nguyên', password: 'password' },
  { id: 10, name: 'Ngô Gia Phúc', email: 'phuc.ngo@example.com', phone: '0822 999 000', role: 'staff', status: 'active', joinedAt: '2026-09-01', address: 'Lục Ngạn, Bắc Giang', password: 'password' }
]

const initialVouchers = [
  { id: 1, code: 'MICHU10', title: 'Giảm 10% đơn hàng', type: 'percent', value: 10, maxDiscount: 50000, minOrder: 0, quantity: 500, used: 214, startDate: '2026-10-01', endDate: '2026-12-31', active: true },
  { id: 2, code: 'MICHU20', title: 'Giảm 20% đơn từ 200.000 đ', type: 'percent', value: 20, maxDiscount: 80000, minOrder: 200000, quantity: 200, used: 187, startDate: '2026-10-01', endDate: '2026-11-30', active: true },
  { id: 3, code: 'FREESHIP', title: 'Miễn phí vận chuyển', type: 'shipping', value: 30000, maxDiscount: 30000, minOrder: 0, quantity: 1000, used: 642, startDate: '2026-09-01', endDate: '2026-12-31', active: true },
  { id: 4, code: 'SHIP15', title: 'Giảm 15.000 đ phí ship', type: 'shipping', value: 15000, maxDiscount: 15000, minOrder: 100000, quantity: 300, used: 300, startDate: '2026-09-01', endDate: '2026-10-31', active: true },
  { id: 5, code: 'TET2027', title: 'Lì xì Tết 50.000 đ', type: 'fixed', value: 50000, maxDiscount: 50000, minOrder: 300000, quantity: 150, used: 0, startDate: '2027-01-15', endDate: '2027-02-15', active: true },
  { id: 6, code: 'KHAITRUONG', title: 'Mừng khai trương cửa hàng online', type: 'fixed', value: 20000, maxDiscount: 20000, minOrder: 0, quantity: 100, used: 100, startDate: '2025-01-01', endDate: '2025-03-01', active: false }
]

const initialBanners = [
  { id: 1, title: 'Hương vị quê nhà, gói trọn vị thương', subtitle: 'Sản phẩm thủ công từ gạo Bắc Giang, gìn giữ qua bốn thế hệ.', image: 'https://images.unsplash.com/photo-1766050586763-723571af4dde?w=1600&h=900&fit=crop&auto=format', ctaText: 'Khám phá sản phẩm', link: '/products', position: 'home-hero', order: 1, active: true },
  { id: 2, title: 'Flash sale cuối tuần – giảm đến 15%', subtitle: 'Áp dụng cho mì Chũ khô, mì tươi và combo quà tặng.', image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=1600&h=900&fit=crop&auto=format', ctaText: 'Mua ngay', link: '/products', position: 'home-hero', order: 2, active: true },
  { id: 3, title: 'Hương vị thủ công từ đất Bắc Giang', subtitle: 'Mì Chũ phơi nắng tự nhiên theo phương pháp truyền thống.', image: 'https://images.unsplash.com/photo-1761307782745-e6383ee42862?w=1600&h=900&fit=crop&auto=format', ctaText: 'Câu chuyện của chúng tôi', link: '/story', position: 'landing-hero', order: 1, active: true },
  { id: 4, title: 'Miễn phí vận chuyển với mã FREESHIP', subtitle: 'Cho mọi đơn hàng trong tháng 11.', image: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=1600&h=900&fit=crop&auto=format', ctaText: 'Xem ưu đãi', link: '/products', position: 'promo', order: 1, active: false }
]

const initialOrders = [
  { id: 'MC20261107014', userId: 2, date: '2026-11-07T08:45', status: 'pending', payment: 'Thanh toán khi nhận hàng', shippingFee: 30000, discount: 0, voucherCode: '', subtotal: 125000, total: 155000, items: [{ productId: 1, name: 'Mì Chũ Khô Truyền Thống', image: 'https://cdn.tgdd.vn/2022/01/CookRecipe/GalleryStep/hoan-thanh-hu-tieu-mi-kho.jpg', price: 45000, quantity: 2 }, { productId: 7, name: 'Bánh Đa Đỏ Bắc Giang 300g', image: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=600&auto=format&fit=crop', price: 35000, quantity: 1 }], note: 'Giao giờ hành chính' },
  { id: 'MC20261106013', userId: 5, date: '2026-11-06T19:20', status: 'pending', payment: 'Chuyển khoản ngân hàng', shippingFee: 30000, discount: 22500, voucherCode: 'MICHU10', subtotal: 225000, total: 232500, items: [{ productId: 8, name: 'Combo Quà Quê Bắc Giang', image: 'https://images.unsplash.com/photo-1556761223-4c4282c73f77?w=600&auto=format&fit=crop', price: 225000, quantity: 1 }], note: '' },
  { id: 'MC20261106012', userId: 3, date: '2026-11-06T10:05', status: 'confirmed', payment: 'Thanh toán khi nhận hàng', shippingFee: 30000, discount: 0, voucherCode: '', subtotal: 160000, total: 190000, items: [{ productId: 2, name: 'Mì Chũ Tươi Nguyên Chất 300g', image: 'https://images.pexels.com/photos/36346857/pexels-photo-36346857/free-photo-of-c-n-c-nh-cac-s-i-mi-s-ng-d-c-s-p-x-p-theo-hinh-d-ng-tr-u-t-ng.jpeg?cs=tinysrgb&dpr=1&w=500', price: 32000, quantity: 3 }, { productId: 6, name: 'Mì Chũ Tươi Đặc Biệt 500g', image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop', price: 48000, quantity: 2 }], note: '' }
]

const initialReviews = [
  { name: 'Nguyễn Thị Hoa', city: 'Hà Nội', review: 'Mì Chũ này đúng vị quê hương, dai giòn, không bị nát khi nấu. Gia đình tôi đặt mua thường xuyên!', rate: 5, date: '2026-11-01' },
  { name: 'Trần Văn Minh', city: 'TP. Hồ Chí Minh', review: 'Lần đầu thử Mì Chũ truyền thống, không ngờ ngon thế. Giao hàng nhanh, đóng gói cẩn thận.', rate: 5, date: '2026-11-03' },
  { name: 'Lê Phương Thảo', city: 'Đà Nẵng', review: 'Mua mì tươi về ăn lẩu tuyệt vời, sợi mì mềm dai không nát chút nào. Sẽ tiếp tục ủng hộ!', rate: 4, date: '2026-11-05' }
]

const initialBlogs = [
  {
    slug: 'vi-sao-mi-chu-phai-phoi-nang',
    title: 'Vì sao mì Chũ phải phơi nắng ba ngày?',
    excerpt: 'Nắng không chỉ làm khô sợi mì. Đó là bước quyết định độ dai, độ giòn và mùi thơm của gạo.',
    category: 'Kiến thức',
    date: '28/10/2026',
    readTime: 5,
    image: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=1200&auto=format&fit=crop',
    content: [
      { type: 'p', text: 'Nhiều người hỏi chúng tôi: sao không sấy máy cho nhanh? Câu trả lời nằm ở chính sợi mì. Phơi nắng tự nhiên giúp hơi nước thoát ra chậm và đều, sợi mì co lại từ từ nên không bị nứt gãy.' },
      { type: 'h', text: 'Nắng giữ lại hương gạo' },
      { type: 'p', text: 'Khi sấy ở nhiệt độ cao, tinh bột trên bề mặt sợi bị chín quá nhanh khiến mì mất mùi thơm. Nắng sớm và nắng chiều ấm vừa đủ để sợi mì khô mà vẫn giữ trọn vị ngọt của gạo.' }
    ]
  },
  {
    slug: '5-mon-ngon-tu-mi-chu-cho-bua-sang',
    title: '5 món ngon từ mì Chũ cho bữa sáng nhanh gọn',
    excerpt: 'Chỉ 15 phút là có ngay bữa sáng nóng hổi, đủ chất cho cả nhà từ một gói mì Chũ.',
    category: 'Công thức',
    date: '20/10/2026',
    readTime: 6,
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=1200&auto=format&fit=crop',
    content: [
      { type: 'p', text: 'Mì Chũ chín nhanh, sợi dai và không bị nát nên rất hợp cho những buổi sáng vội vàng.' }
    ]
  }
]

const seedData = async (force = false) => {
  try {
    const db = GET_DB()

    const productCount = await db.collection(DATABASE_COLLECTIONS.PRODUCTS).countDocuments()
    if (productCount > 0 && !force) {
      return { message: 'Cơ sở dữ liệu đã có dữ liệu sẵn, không cần khởi tạo lại!' }
    }

    if (force) {
      await Promise.all([
        db.collection(DATABASE_COLLECTIONS.PRODUCTS).deleteMany({}),
        db.collection(DATABASE_COLLECTIONS.CATEGORIES).deleteMany({}),
        db.collection(DATABASE_COLLECTIONS.USERS).deleteMany({}),
        db.collection(DATABASE_COLLECTIONS.VOUCHERS).deleteMany({}),
        db.collection(DATABASE_COLLECTIONS.BANNERS).deleteMany({}),
        db.collection(DATABASE_COLLECTIONS.ORDERS).deleteMany({}),
        db.collection(DATABASE_COLLECTIONS.REVIEWS).deleteMany({}),
        db.collection(DATABASE_COLLECTIONS.BLOGS).deleteMany({})
      ])
    }

    const now = Date.now()
    const mapWithDates = (arr) => arr.map((item) => ({ ...item, createdAt: now, updatedAt: null, _destroy: false }))

    const [insertedProds, insertedUsers] = await Promise.all([
      db.collection(DATABASE_COLLECTIONS.PRODUCTS).insertMany(mapWithDates(initialProducts)),
      db.collection(DATABASE_COLLECTIONS.USERS).insertMany(mapWithDates(initialUsers))
    ])
    const p1ObjectId = insertedProds.insertedIds[0]
    const p2ObjectId = insertedProds.insertedIds[1]

    const reviewsToInsert = [
      { productId: p1ObjectId, ...initialReviews[0], createdAt: now },
      { productId: p1ObjectId, ...initialReviews[1], createdAt: now },
      { productId: p2ObjectId, ...initialReviews[2], createdAt: now }
    ]

    const ordersToInsert = initialOrders.map((ord) => {
      const uIndex = initialUsers.findIndex((u) => u.id === ord.userId)
      const userObjectId = uIndex !== -1 ? insertedUsers.insertedIds[uIndex] : new ObjectId()

      const itemsWithObjectId = ord.items.map((item) => {
        const pIndex = initialProducts.findIndex((p) => p.id === item.productId)
        const prodObjectId = pIndex !== -1 ? insertedProds.insertedIds[pIndex] : new ObjectId()
        return {
          ...item,
          productId: prodObjectId
        }
      })

      return {
        ...ord,
        userId: userObjectId,
        items: itemsWithObjectId,
        createdAt: now,
        updatedAt: null,
        _destroy: false
      }
    })

    await Promise.all([
      db.collection(DATABASE_COLLECTIONS.CATEGORIES).insertMany(mapWithDates(initialCategories)),
      db.collection(DATABASE_COLLECTIONS.VOUCHERS).insertMany(mapWithDates(initialVouchers)),
      db.collection(DATABASE_COLLECTIONS.BANNERS).insertMany(mapWithDates(initialBanners)),
      db.collection(DATABASE_COLLECTIONS.ORDERS).insertMany(ordersToInsert),
      db.collection(DATABASE_COLLECTIONS.REVIEWS).insertMany(reviewsToInsert),
      db.collection(DATABASE_COLLECTIONS.BLOGS).insertMany(mapWithDates(initialBlogs))
    ])

    return { message: 'Khởi tạo dữ liệu mẫu thành công!' }
  } catch (error) {
    throw error
  }
}

export const seedService = {
  seedData
}
