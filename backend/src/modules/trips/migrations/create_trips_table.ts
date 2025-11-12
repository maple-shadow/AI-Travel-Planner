import { SupabaseClient } from '@supabase/supabase-js'

// 创建行程表的SQL语句
export const createTripsTableSQL = `
CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  destination VARCHAR(200) NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'confirmed', 'in_progress', 'completed', 'cancelled', 'postponed')),
  type VARCHAR(20) NOT NULL DEFAULT 'leisure' CHECK (type IN ('business', 'leisure', 'family', 'adventure', 'educational', 'other')),
  priority VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  budget DECIMAL(15,2),
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);
CREATE INDEX IF NOT EXISTS idx_trips_type ON trips(type);
CREATE INDEX IF NOT EXISTS idx_trips_priority ON trips(priority);
CREATE INDEX IF NOT EXISTS idx_trips_start_date ON trips(start_date);
CREATE INDEX IF NOT EXISTS idx_trips_end_date ON trips(end_date);
CREATE INDEX IF NOT EXISTS idx_trips_destination ON trips(destination);
CREATE INDEX IF NOT EXISTS idx_trips_created_at ON trips(created_at);

-- 创建全文搜索索引
CREATE INDEX IF NOT EXISTS idx_trips_search ON trips USING GIN (
  to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || destination)
);

-- 创建复合索引
CREATE INDEX IF NOT EXISTS idx_trips_user_status ON trips(user_id, status);
CREATE INDEX IF NOT EXISTS idx_trips_user_dates ON trips(user_id, start_date, end_date);

-- 添加约束：结束日期必须晚于开始日期
ALTER TABLE trips ADD CONSTRAINT chk_trip_dates CHECK (end_date > start_date);

-- 添加约束：预算必须为正数
ALTER TABLE trips ADD CONSTRAINT chk_trip_budget CHECK (budget IS NULL OR budget >= 0);

-- 创建触发器自动更新updated_at字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_trips_updated_at 
    BEFORE UPDATE ON trips 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
`

// 删除行程表的SQL语句
export const dropTripsTableSQL = `
DROP TRIGGER IF EXISTS update_trips_updated_at ON trips;
DROP FUNCTION IF EXISTS update_updated_at_column;
DROP TABLE IF EXISTS trips;
`

// 创建行程表
export const createTripsTable = async (supabase: SupabaseClient): Promise<void> => {
    try {
        console.log('🚀 开始创建行程表...')

        const { error } = await supabase.rpc('exec_sql', { sql: createTripsTableSQL })

        if (error) {
            // 如果RPC方法不存在，尝试直接执行SQL
            console.log('⚠️ RPC方法不存在，尝试直接执行SQL...')

            // 由于Supabase的安全限制，可能需要通过管理界面执行SQL
            // 这里我们记录SQL语句供手动执行
            console.log('📋 请通过Supabase管理界面执行以下SQL语句:')
            console.log(createTripsTableSQL)

            throw new Error('需要通过Supabase管理界面手动执行SQL语句')
        }

        console.log('✅ 行程表创建成功')
    } catch (error) {
        console.error('❌ 创建行程表失败:', error)
        throw error
    }
}

// 删除行程表
export const dropTripsTable = async (supabase: SupabaseClient): Promise<void> => {
    try {
        console.log('🗑️ 开始删除行程表...')

        const { error } = await supabase.rpc('exec_sql', { sql: dropTripsTableSQL })

        if (error) {
            console.log('⚠️ RPC方法不存在，尝试直接执行SQL...')
            console.log('📋 请通过Supabase管理界面执行以下SQL语句:')
            console.log(dropTripsTableSQL)

            throw new Error('需要通过Supabase管理界面手动执行SQL语句')
        }

        console.log('✅ 行程表删除成功')
    } catch (error) {
        console.error('❌ 删除行程表失败:', error)
        throw error
    }
}

// 检查行程表是否存在
export const checkTripsTableExists = async (supabase: SupabaseClient): Promise<boolean> => {
    try {
        // 尝试查询行程表
        const { data, error } = await supabase
            .from('trips')
            .select('id')
            .limit(1)

        if (error) {
            if (error.code === '42P01') { // 表不存在
                return false
            }
            throw error
        }

        return true
    } catch (error) {
        console.error('❌ 检查行程表存在性失败:', error)
        return false
    }
}

// 运行迁移
export const runMigration = async (supabase: SupabaseClient): Promise<void> => {
    try {
        const tableExists = await checkTripsTableExists(supabase)

        if (tableExists) {
            console.log('ℹ️ 行程表已存在，跳过创建')
            return
        }

        await createTripsTable(supabase)
        console.log('🎉 行程表迁移完成')
    } catch (error) {
        console.error('❌ 行程表迁移失败:', error)
        throw error
    }
}

export default {
    createTripsTableSQL,
    dropTripsTableSQL,
    createTripsTable,
    dropTripsTable,
    checkTripsTableExists,
    runMigration
}