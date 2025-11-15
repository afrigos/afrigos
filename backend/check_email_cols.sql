SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND (column_name LIKE '%email%verification%' OR column_name LIKE '%verification%code%' OR column_name = 'isVerified')
ORDER BY column_name;
