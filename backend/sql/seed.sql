INSERT INTO academic_sessions (name, start_date, end_date)
SELECT 
  CONCAT(start_year, '-', RIGHT((start_year + 1)::text, 2)),
  MAKE_DATE(start_year, 4, 1),
  MAKE_DATE(start_year + 1, 3, 31)
FROM (
  SELECT 
    CASE 
      WHEN EXTRACT(MONTH FROM CURRENT_DATE) >= 4 
      THEN EXTRACT(YEAR FROM CURRENT_DATE)::int
      ELSE (EXTRACT(YEAR FROM CURRENT_DATE)::int - 1)
    END AS start_year
) t
WHERE NOT EXISTS (
  SELECT 1 FROM academic_sessions
);