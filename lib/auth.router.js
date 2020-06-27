const express = require('express')
const router = express.Router()
const passport = require('passport')
const authController = require('./auth.controller')

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

module.exports = router