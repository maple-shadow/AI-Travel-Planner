import dotenv from 'dotenv'
import Joi from 'joi'

// 加载环境变量
dotenv.config()

// 服务器配置
export const serverConfig = {
    port: parseInt(process.env.PORT || '5000'),
    nodeEnv: process.env.NODE_ENV || 'development',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
}

// 数据库配置
export const databaseConfig = {
    mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-travel-planner',
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '10'),
    connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30000')
}

// 认证配置
export const authConfig = {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12')
}

// 第三方服务配置
export const thirdPartyConfig = {
    aliyunBailian: {
        apiKey: process.env.ALIYUN_BAILIAN_API_KEY || '',
        apiSecret: process.env.ALIYUN_BAILIAN_API_SECRET || ''
    },
    iflytek: {
        appId: process.env.IFLYTEK_APP_ID || '',
        apiKey: process.env.IFLYTEK_API_KEY || '',
        apiSecret: process.env.IFLYTEK_API_SECRET || ''
    },
    amap: {
        apiKey: process.env.AMAP_API_KEY || ''
    }
}

// 环境变量验证模式
const envVarsSchema = Joi.object({
    NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
    PORT: Joi.number().default(5000),

    // 数据库配置
    MONGODB_URI: Joi.string().required().description('MongoDB连接URI'),

    // JWT配置
    JWT_SECRET: Joi.string().required().description('JWT密钥'),
    JWT_EXPIRES_IN: Joi.string().default('7d').description('JWT过期时间'),

    // 第三方服务配置
    ALIYUN_BAILIAN_API_KEY: Joi.string().description('阿里云百炼API密钥'),
    ALIYUN_BAILIAN_SECRET: Joi.string().description('阿里云百炼API密钥'),
    IFLYTEK_API_KEY: Joi.string().description('科大讯飞API密钥'),
    IFLYTEK_API_SECRET: Joi.string().description('科大讯飞API密钥'),
    AMAP_API_KEY: Joi.string().description('高德地图API密钥'),

    // Supabase配置
    SUPABASE_URL: Joi.string().description('Supabase项目URL'),
    SUPABASE_ANON_KEY: Joi.string().description('Supabase匿名密钥'),

    // 前端URL
    FRONTEND_URL: Joi.string().default('http://localhost:3000').description('前端应用URL'),

    // 文件上传配置
    UPLOAD_MAX_SIZE: Joi.number().default(10 * 1024 * 1024).description('文件上传最大大小'),

    // 日志配置
    LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug').default('info').description('日志级别')
}).unknown(true)

// 验证环境变量
const { value: envVars, error } = envVarsSchema.validate(process.env)

if (error) {
    throw new Error(`环境变量配置错误: ${error.message}`)
}

// 环境变量验证
export const validateEnvironment = (): void => {
    // Joi验证已经完成，这里保持空函数以保持接口兼容性
}

// 基于验证后的环境变量重新创建配置对象
const validatedServerConfig = {
    port: envVars.PORT,
    nodeEnv: envVars.NODE_ENV,
    frontendUrl: envVars.FRONTEND_URL,
    logLevel: envVars.LOG_LEVEL
}

const validatedDatabaseConfig = {
    uri: envVars.MONGODB_URI
}

const validatedAuthConfig = {
    jwtSecret: envVars.JWT_SECRET,
    jwtExpiresIn: envVars.JWT_EXPIRES_IN
}

const validatedThirdPartyConfig = {
    aliyunBailian: {
        apiKey: envVars.ALIYUN_BAILIAN_API_KEY,
        secret: envVars.ALIYUN_BAILIAN_SECRET
    },
    iflytek: {
        apiKey: envVars.IFLYTEK_API_KEY,
        secret: envVars.IFLYTEK_API_SECRET
    },
    amap: {
        apiKey: envVars.AMAP_API_KEY
    },
    supabase: {
        url: envVars.SUPABASE_URL,
        anonKey: envVars.SUPABASE_ANON_KEY
    }
}

const validatedUploadConfig = {
    maxSize: envVars.UPLOAD_MAX_SIZE
}

// 导出配置对象
export const environment = {
    validate: validateEnvironment,
    server: validatedServerConfig,
    database: validatedDatabaseConfig,
    auth: validatedAuthConfig,
    thirdParty: validatedThirdPartyConfig,
    upload: validatedUploadConfig
}

export default environment