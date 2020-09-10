// 想定されるクライアントサーバのドメイン
exports.CLIENT_ORIGIN = process.env.NODE_ENV === 'production'
  ? [process.env.CLIENT_DOMAIN_PRODUCTION1, process.env.CLIENT_DOMAIN_PRODUCTION2]
  : [process.env.CLIENT_DOMAIN_DEVELOP1, process.env.CLIENT_DOMAIN_DEVELOP2]

// 認証に必要な情報の読み込み
exports.TWITTER_CONFIG = {
  consumerKey: process.env.TWITTER_KEY,
  consumerSecret: process.env.TWITTER_SECRET,
}

// DBの設定
exports.DB_CONFIG = {
  host: process.env.DB_CONFIG_HOST,
  user: process.env.DB_CONFIG_USER,
  password: process.env.DB_CONFIG_PASSWORD,
  database: process.env.DB_CONFIG_DATABASE,
}

// AUTH0への認証に必要な情報
exports.AUTH0_CONFIG = {
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  domain: process.env.AUTH0_DOMAIN,
}