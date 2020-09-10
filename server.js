/*

HTTPSサーバとHTTPサーバを起動する

*/

require('dotenv').config();                           // .envファイルから設定の読み出し
const express = require('express');                   // nodeフレームワーク
const fs = require('fs');                             // 標準ファイル書き込み
const https = require('https');                       // https対応
const http = require('http');                         // httpリダイレクト用
const cors = require('cors');                         // クロスオリジンアクセス許可用
const authRouter = require('./lib/router');           // ルーティング
const { CLIENT_ORIGIN } = require('./config');        // 設定の読み出し

// expressの初期設定
const app = express()

// 各種ミドルウェアの設置
app.use(express.json());                              // JSONサポート
app.use(express.urlencoded({ extended: true }));      // Urlエンコ
app.use(cors({origin: CLIENT_ORIGIN, credentials: true, samesite: 'none', secure: true}));           // WebClientServerからのCORS通信のみ許可

// カスタムミドルウェアの設定
app.use('/', authRouter);

// HTTPSサーバの起動
const certOptions = {
  key: fs.readFileSync('./certs/server.key'),
  cert: fs.readFileSync('./certs/0000_cert.pem'),
  ca: fs.readFileSync('./certs/0000_chain.pem')
}
let server = https.createServer(certOptions, app)

// HTTPサーバの起動
http.createServer((express()).all("*", function (request, response) {
  response.redirect(`https://${request.hostname}${request.url}`);
})).listen(80);
server.listen(443);