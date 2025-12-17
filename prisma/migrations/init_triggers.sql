-- Prisma 不支持触发器，需要手动执行此 SQL
-- 在首次设置数据库后运行：prisma db execute --file prisma/migrations/init_triggers.sql

-- 更新时间戳触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为 contracts 表添加更新触发器
DROP TRIGGER IF EXISTS update_contracts_updated_at ON contracts;
CREATE TRIGGER update_contracts_updated_at
    BEFORE UPDATE ON contracts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 为 contract_instances 表添加更新触发器
DROP TRIGGER IF EXISTS update_contract_instances_updated_at ON contract_instances;
CREATE TRIGGER update_contract_instances_updated_at
    BEFORE UPDATE ON contract_instances
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

