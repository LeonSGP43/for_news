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
      queueLimit: 0,
      connectTimeout: 60000,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000
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
  // 先获取最近一次爬取的时间
  const latestSql = `
    SELECT MAX(scraped_at) as latest FROM news_articles
  `
  const [latest] = await query<{ latest: Date }>(latestSql)
  
  if (!latest?.latest) {
    return []
  }
  
  // 获取最近一次爬取的全部数据（10分钟内的都算同一批）
  const sql = `
    SELECT title as t, description as d, \`rank\` as r, section as s
    FROM news_articles 
    WHERE scraped_at >= DATE_SUB(?, INTERVAL 10 MINUTE)
    ORDER BY section, \`rank\` ASC
  `
  return query(sql, [latest.latest])
}

export default { getPool, initDB }
