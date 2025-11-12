// MongoDB初始化脚本
db = db.getSiblingDB('ai_travel_planner');

// 创建应用用户
db.createUser({
    user: 'app_user',
    pwd: 'app_password123',
    roles: [
        {
            role: 'readWrite',
            db: 'ai_travel_planner'
        }
    ]
});

// 创建集合和索引
db.createCollection('users');
db.createCollection('trip_plans');
db.createCollection('budgets');

// 为用户集合创建索引
db.users.createIndex({ email: 1 }, { unique: true });

// 为行程计划集合创建索引
db.trip_plans.createIndex({ userId: 1, createdAt: -1 });
db.trip_plans.createIndex({ destination: 'text', description: 'text' });

// 为预算集合创建索引
db.budgets.createIndex({ userId: 1, tripPlanId: 1 });

print('MongoDB initialization completed successfully!');