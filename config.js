const providers = ['twitter']

// コールバック先URL
const callbacks = providers.map(provider => {
  return process.env.NODE_ENV === 'production'
    ? `http://localhost:18080/${provider}/callback`
    : `http://localhost:18080/${provider}/callback`
})

const [twitterURL] = callbacks

// 想定されるクライアントサーバのドメイン
exports.CLIENT_ORIGIN = process.env.NODE_ENV === 'production'
  ? ['http://127.0.0.1:8080', 'http://localhost:8080']
  : ['http://127.0.0.1:8080', 'http://localhost:8080']

// 認証に必要な情報の読み込み
exports.TWITTER_CONFIG = {
  consumerKey: process.env.TWITTER_KEY,
  consumerSecret: process.env.TWITTER_SECRET,
  callbackURL: twitterURL,
}