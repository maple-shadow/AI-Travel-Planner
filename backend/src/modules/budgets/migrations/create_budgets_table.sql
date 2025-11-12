-- 创建预算表
CREATE TABLE IF NOT EXISTS budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    trip_id UUID REFERENCES trips(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL DEFAULT 'general',
    total_amount DECIMAL(15,2) NOT NULL CHECK (total_amount >= 0),
    used_amount DECIMAL(15,2) NOT NULL DEFAULT 0 CHECK (used_amount >= 0),
    remaining_amount DECIMAL(15,2) NOT NULL DEFAULT 0 CHECK (remaining_amount >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'CNY',
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'exceeded')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 约束：已用金额不能超过总金额
    CONSTRAINT used_amount_check CHECK (used_amount <= total_amount),
    -- 约束：结束日期必须大于开始日期
    CONSTRAINT date_check CHECK (end_date >= start_date)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_trip_id ON budgets(trip_id);
CREATE INDEX IF NOT EXISTS idx_budgets_category ON budgets(category);
CREATE INDEX IF NOT EXISTS idx_budgets_status ON budgets(status);
CREATE INDEX IF NOT EXISTS idx_budgets_dates ON budgets(start_date, end_date);

-- 启用行级安全
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能访问自己的预算
CREATE POLICY "用户只能访问自己的预算" ON budgets
    FOR ALL USING (auth.uid() = user_id);

-- 创建更新触发器
CREATE OR REPLACE FUNCTION update_budgets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_budgets_updated_at
    BEFORE UPDATE ON budgets
    FOR EACH ROW
    EXECUTE FUNCTION update_budgets_updated_at();