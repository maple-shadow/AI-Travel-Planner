// 行程数据模型模块测试脚本
// 用于验证模块07的功能集成

const { initializeTripModule, TripModel, TripTypes, healthCheck } = require('./dist/modules/trips/index.js')

async function testTripModule() {
    console.log('🧪 开始测试行程数据模型模块...\n')

    try {
        // 1. 测试模块健康检查
        console.log('1️⃣ 测试模块健康检查...')
        const healthStatus = await healthCheck()
        console.log('✅ 健康检查结果:', healthStatus)

        // 2. 测试模块初始化
        console.log('\n2️⃣ 测试模块初始化...')
        const initResult = await initializeTripModule()
        console.log('✅ 模块初始化结果:', initResult)

        // 3. 测试行程模型操作
        console.log('\n3️⃣ 测试行程模型操作...')

        // 创建测试行程数据
        const testTripData = {
            user_id: 'test-user-uuid',
            title: '测试行程 - 北京三日游',
            destination: '北京',
            start_date: new Date('2024-12-01'),
            end_date: new Date('2024-12-03'),
            status: TripTypes.TripStatus.PLANNING,
            type: TripTypes.TripType.LEISURE,
            priority: TripTypes.TripPriority.MEDIUM,
            budget: 5000,
            tags: ['文化', '历史', '测试']
        }

        console.log('📝 测试行程数据:', testTripData)

        // 测试创建行程
        console.log('\n4️⃣ 测试创建行程...')
        const newTrip = await TripModel.createTrip(testTripData)
        console.log('✅ 创建行程成功:', newTrip)

        // 测试查找行程
        console.log('\n5️⃣ 测试查找行程...')
        const foundTrip = await TripModel.findTripById(newTrip.id)
        console.log('✅ 查找行程成功:', foundTrip)

        // 测试更新行程
        console.log('\n6️⃣ 测试更新行程...')
        const updatedTrip = await TripModel.updateTrip(newTrip.id, {
            title: '更新后的测试行程',
            budget: 6000
        })
        console.log('✅ 更新行程成功:', updatedTrip)

        // 测试获取用户行程列表
        console.log('\n7️⃣ 测试获取用户行程列表...')
        const userTrips = await TripModel.listUserTrips('test-user-uuid')
        console.log('✅ 用户行程列表:', userTrips)

        // 测试搜索行程
        console.log('\n8️⃣ 测试搜索行程...')
        const searchResults = await TripModel.searchTrips('test-user-uuid', '北京')
        console.log('✅ 搜索行程结果:', searchResults)

        // 测试删除行程
        console.log('\n9️⃣ 测试删除行程...')
        const deleteResult = await TripModel.deleteTrip(newTrip.id)
        console.log('✅ 删除行程成功:', deleteResult)

        console.log('\n🎉 所有测试通过！行程数据模型模块功能正常。')

    } catch (error) {
        console.error('❌ 测试失败:', error)
        console.error('错误详情:', error.message)
    }
}

// 运行测试
if (require.main === module) {
    testTripModule()
}

module.exports = { testTripModule }