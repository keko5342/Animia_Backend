require('dotenv').config();                                   //.envファイルから設定の読み出し
const express = require('express');                           //nodeフレームワーク
const path = require('path');                                 //標準ファイル読み込み
const fs = require('fs');                                     //標準ファイル書き込み
const https = require('https');
const http = require('http');
const passport = require('passport');                         //API連携（今回はTwitter）
const session = require('express-session');
const cors = require('cors');                                 //クロスオリジンアクセス
const socketio = require('socket.io');                        //WebSocket
const authRouter = require('./lib/auth.router');              //ルーティング
const passportInit = require('./lib/passport.init');          //パスポート設定
const { SESSION_SECRET, CLIENT_ORIGIN } = require('./config');//各種設定の読み出し
const cookieParser = require('cookie-parser');                 //Cookieを解析


const app = express()

// .env ? 開発用サーバ→HTTP : HTTPS
let server;
if(process.env.NODE_ENV === 'dev') {
  server = http.createServer(app);
}else{
/*
  // SSH info
  const certOptions = {
    key: fs.readFileSync('orekey.pem'),
    cert: fs.readFileSync('orecert.pem')
  }
  server = https.createServer(certOptions, app)
  */
}

// 各種ミドルウェアの設置
app.use(express.json());                          // JSONサポート
app.use(express.urlencoded({ extended: true }));  // Urlエンコ
app.use(cors({origin: CLIENT_ORIGIN, credentials: true, secure: true}));           // WebClientServerからのCORS通信のみ許可
app.use(passport.initialize());                   // APIリクエスト対応
passportInit();

// セッション情報の設定
app.use(session({ 
  secret: process.env.SESSION_SECRET, 
  resave: true, 
  saveUninitialized: true
}));

// WebSocketミドルウェアの設置
const io = socketio(server);
app.set('io', io);

// 起動確認
app.get('/wake-up', (req, res) => res.send('👍'));

// カスタムミドルウェア
app.use('/', authRouter);

// サーバ起動時の設定
server.listen(process.env.PORT || 18080, () => {
  console.log('listening...18080')
});
