const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('./auth.controller');
const authTokenFetcher = require('./auth0.tokenFetcher');
const fetchProfile = require('./fetchProfile');
const fetchListName = require('./fetchListName');

// twitter用ストラテジ
const twitterAuth = passport.authenticate('twitter');

// twitterAPIのコールバック先
router.get('/twitter/callback', twitterAuth, authController.twitter);

// セッションIDとソケットIDをリンク
router.use((req, res, next) => {
  req.session.socketId = req.query.socketId;
  next();
})

// clientの認証リクエスト先
router.get('/twitter', twitterAuth);

// Auth0からTwitterのトークンを取得
router.get('/callback', authTokenFetcher.tokenFetcher);

// 認証済みクライアント向け各種情報取得
router.get('/auth/profile', fetchProfile.fetchProfile);
router.get('/auth/listName', fetchListName.fetchTwitterData);

module.exports = router;