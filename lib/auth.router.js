const express = require('express')
const router = express.Router()
const passport = require('passport')
const authController = require('./auth.controller')
const authTokenFetcher = require('./auth0.tokenFetcher')

// twitter用ストラテジ
const twitterAuth = passport.authenticate('twitter')

// twitterAPIのコールバック先
router.get('/twitter/callback', twitterAuth, authController.twitter)

// セッションIDとソケットIDをリンク
router.use((req, res, next) => {
  req.session.socketId = req.query.socketId
  next()
})

// clientの認証リクエスト先
router.get('/twitter', twitterAuth)

// Auth0からTwitterのトークンを取得
router.get('/test', authTokenFetcher.tokenFetcher)

module.exports = router