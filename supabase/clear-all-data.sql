-- 모든 테이블의 데이터를 삭제하는 SQL
-- 외래 키 제약 조건을 고려하여 자식 테이블부터 삭제합니다.

-- 1. 가장 깊은 자식 테이블부터 삭제
DELETE FROM experiment_photos;

-- 2. recipe_experiments 삭제
DELETE FROM recipe_experiments;

-- 3. recipes의 직접 자식 테이블들 삭제
DELETE FROM recipe_equipment;
DELETE FROM recipe_ingredients;
DELETE FROM recipe_outputs;
DELETE FROM recipe_steps;

-- 4. 마지막으로 부모 테이블 삭제
DELETE FROM recipes;

-- 삭제 확인 (선택사항)
-- SELECT 'experiment_photos' as table_name, COUNT(*) as count FROM experiment_photos
-- UNION ALL
-- SELECT 'recipe_experiments', COUNT(*) FROM recipe_experiments
-- UNION ALL
-- SELECT 'recipe_equipment', COUNT(*) FROM recipe_equipment
-- UNION ALL
-- SELECT 'recipe_ingredients', COUNT(*) FROM recipe_ingredients
-- UNION ALL
-- SELECT 'recipe_outputs', COUNT(*) FROM recipe_outputs
-- UNION ALL
-- SELECT 'recipe_steps', COUNT(*) FROM recipe_steps
-- UNION ALL
-- SELECT 'recipes', COUNT(*) FROM recipes;

