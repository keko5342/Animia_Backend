/*

フロントエンドサーバのドメイン（config.js）からのアクセスに対してルーティングする

*/

const express = require('express');
const router = express.Router();
const authTokenFetcher = require('./Auth/auth0.tokenFetcher');
const fetchProfile = require('./API/fetchProfile');
const fetchListName = require('./API/fetchListName');
const fetchUsers = require('./API/fetchUsers');
const fetchSearch = require('./API/fetchSearch');

// Auth0からTwitterのトークンを取得
router.get('/callback', authTokenFetcher.tokenFetcher);

// 認証済みクライアント向け各種情報取得
router.get('/auth/profile', fetchProfile.fetchProfile);
router.get('/auth/listName', fetchListName.fetchTwitterData);
router.get('/auth/users', fetchUsers.fetchUsers)
router.get('/auth/search', fetchSearch.fetchSearch)

module.exports = router;