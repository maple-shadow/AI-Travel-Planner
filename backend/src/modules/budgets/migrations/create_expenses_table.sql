-- 创建开销表
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL DEFAULT 'other' CHECK (category IN ('transportation', 'accommodation', 'food', 'entertainment', 'shopping', 'other')),
    type VARCHAR(50) NOT NULL DEFAULT 'expense' CHECK (type IN ('expense', 'transportation', 'accommodation', 'food', 'entertainment', 'shopping', 'other')),
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'CNY',
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    location VARCHAR(255),
    receipt_url TEXT,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 约束：开销日期不能晚于当前日期
    CONSTRAINT expense_date_check CHECK (expense_date <= CURRENT_DATE)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_expenses_budget_id ON expenses(budget_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_type ON expenses(type);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_tags ON expenses USING GIN(tags);

-- 启用行级安全
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能访问自己的开销
CREATE POLICY "用户只能访问自己的开销" ON expenses
    FOR ALL USING (auth.uid()::text = user_id::text)
    WITH CHECK (auth.uid()::text = user_id::text);

-- 创建更新触发器
CREATE OR REPLACE FUNCTION update_expenses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_expenses_updated_at
    BEFORE UPDATE ON expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_expenses_updated_at();

-- 创建触发器：当添加开销时更新预算的已用金额
CREATE OR REPLACE FUNCTION update_budget_used_amount_on_expense()
RETURNS TRIGGER AS $$
BEGIN
    -- 更新预算的已用金额
    UPDATE budgets 
    SET used_amount = used_amount + NEW.amount,
        updated_at = NOW()
    WHERE id = NEW.budget_id;
    
    -- 检查预算状态是否需要更新
    UPDATE budgets 
    SET status = CASE 
        WHEN used_amount >= total_amount THEN 'exceeded'
        WHEN used_amount > 0.9 * total_amount THEN 'active' -- 可以添加警告状态
        ELSE status
    END
    WHERE id = NEW.budget_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_budget_on_expense_insert
    AFTER INSERT ON expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_budget_used_amount_on_expense();

-- 创建触发器：当更新开销时更新预算的已用金额
CREATE OR REPLACE FUNCTION update_budget_used_amount_on_expense_update()
RETURNS TRIGGER AS $$
BEGIN
    -- 如果预算ID或金额发生变化，更新预算
    IF OLD.budget_id != NEW.budget_id OR OLD.amount != NEW.amount THEN
        -- 从旧预算中减去金额
        UPDATE budgets 
        SET used_amount = used_amount - OLD.amount,
            updated_at = NOW()
        WHERE id = OLD.budget_id;
        
        -- 向新预算中添加金额
        UPDATE budgets 
        SET used_amount = used_amount + NEW.amount,
            updated_at = NOW()
        WHERE id = NEW.budget_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_budget_on_expense_update
    AFTER UPDATE ON expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_budget_used_amount_on_expense_update();

-- 创建触发器：当删除开销时更新预算的已用金额
CREATE OR REPLACE FUNCTION update_budget_used_amount_on_expense_delete()
RETURNS TRIGGER AS $$
BEGIN
    -- 从预算中减去金额
    UPDATE budgets 
    SET used_amount = used_amount - OLD.amount,
        updated_at = NOW()
    WHERE id = OLD.budget_id;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_budget_on_expense_delete
    AFTER DELETE ON expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_budget_used_amount_on_expense_delete();