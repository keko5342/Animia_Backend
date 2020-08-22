require('dotenv').config();                                   //.envファイルから設定の読み出し
const express = require('express');                           //nodeフレームワーク
const path = require('path');                                 //標準ファイル読み込み
const fs = require('fs');                                     //標準ファイル書き込み
const https = require('https');
const http = require('http');
const passport = require('passport');                         //API連携（今回はTwitter）
const cors = require('cors');                                 //クロスオリジンアクセス
const authRouter = require('./lib/auth.router');              //ルーティング
const passportInit = require('./lib/passport.init');          //パスポート設定
const { SESSION_SECRET, CLIENT_ORIGIN } = require('./config');//各種設定の読み出し
const cookieParser = require('cookie-parser');                 //Cookieを解析

const app = express()

let server;
// SSH info
const certOptions = {
  key: fs.readFileSync('./certs/server.key'),
  cert: fs.readFileSync('./certs/0000_cert.pem'),
  ca: fs.readFileSync('./certs/0000_chain.pem')
}
server = https.createServer(certOptions, app)
//}

// 各種ミドルウェアの設置
app.use(express.json());                          // JSONサポート
app.use(express.urlencoded({ extended: true }));  // Urlエンコ
app.use(cors({origin: CLIENT_ORIGIN, credentials: true, samesite: 'none', secure: true}));           // WebClientServerからのCORS通信のみ許可
app.use(passport.initialize());                   // APIリクエスト対応
passportInit();

/*
// セッション情報の設定
app.use(session({ 
  secret: process.env.SESSION_SECRET, 
  resave: true, 
  saveUninitialized: true
}));
*/

// 起動確認
app.get('/wake-up', (req, res) => res.send('👍'));

// カスタムミドルウェア
app.use('/', authRouter);

// サーバ起動時の設定
http.createServer((express()).all("*", function (request, response) {
  response.redirect(`https://${request.hostname}${request.url}`);
})).listen(80);
server.listen(443);