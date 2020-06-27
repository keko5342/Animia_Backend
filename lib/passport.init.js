const passport = require('passport')
const { Strategy: TwitterStrategy } = require('passport-twitter')
const { TWITTER_CONFIG } = require('../config')

// 各種API（今回はTwitterのみ）との連携を行うに際して認証に使うキーを読み込む
module.exports = () => {  

  // シリアル化とデシリアルの準備 | user情報の管理
  passport.serializeUser((user, cb) => cb(null, user))
  passport.deserializeUser((obj, cb) => cb(null, obj))
  
  // Twitterから帰ってくる値のうち、Profile情報のみをレスポンスとして出力する。
  // ここの値をaccessTokenにすれば、タイムライン等の取得も可能（要別パッケージ）
  const callback = (accessToken, accessTokenSecret, refreshToken, profile, cb) => {
    console.log('accessToken:', accessToken, 'accessTokenSecret:', accessTokenSecret)
    cb(null, profile)
  }

  // ミドルウェアの登録
  passport.use(new TwitterStrategy(TWITTER_CONFIG, callback))
}