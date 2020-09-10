require('dotenv').config();                                   //.envファイルから設定の読み出し
const express = require('express');                           //nodeフレームワーク
const fs = require('fs');                                     //標準ファイル書き込み
const https = require('https');
const http = require('http');
const cors = require('cors');                                 //クロスオリジンアクセス
const authRouter = require('./lib/router');              //ルーティング
const { CLIENT_ORIGIN } = require('./config');//各種設定の読み出し

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

// 起動確認
app.get('/wake-up', (req, res) => res.send('👍'));

// カスタムミドルウェア
app.use('/', authRouter);

// サーバ起動時の設定
http.createServer((express()).all("*", function (request, response) {
  response.redirect(`https://${request.hostname}${request.url}`);
})).listen(80);
server.listen(443);