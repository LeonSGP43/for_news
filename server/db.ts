import mysql from 'mysql2/promise'

let pool: mysql.Pool | null = null

function getPool(): mysql.Pool {
  if (!pool) {
    console.log('🔌 Creating MySQL pool with:', {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      database: process.env.DB_NAME
    })
    
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'theNews',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    })
  }
  return pool
}

export async function initDB() {
  try {
    const conn = await getPool().getConnection()
    console.log('✅ MySQL connected')
    conn.release()
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('❌ MySQL connection failed:', message)
    process.exit(1)
  }
}

export async function query<T>(sql: string, params?: unknown[]): Promise<T[]> {
  const [rows] = await getPool().execute(sql, params)
  return rows as T[]
}

export async function getArticles(hours = 1) {
  const sql = `
    SELECT * FROM news_articles 
    WHERE scraped_at >= DATE_SUB(NOW(), INTERVAL ? HOUR)
    ORDER BY section, \`rank\` ASC
  `
  return query(sql, [hours])
}

export async function getSections() {
  const sql = `
    SELECT DISTINCT section FROM news_articles 
    WHERE scraped_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
    AND section IS NOT NULL
    ORDER BY section
  `
  const rows = await query<{ section: string }>(sql)
  return rows.map(r => r.section)
}

export async function getArticlesForAI(hours = 1) {
  const sql = `
    SELECT 
      id, title, description, source, platform, section,
      \`rank\`, heat, score, trend, rank_change, momentum,
      time_str, datetime, scraped_at
    FROM news_articles 
    WHERE scraped_at >= DATE_SUB(NOW(), INTERVAL ? HOUR)
    ORDER BY platform, \`rank\` ASC
    LIMIT 2000
  `
  return query(sql, [hours])
}

export default { getPool, initDB }
