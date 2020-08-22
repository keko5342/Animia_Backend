const mysql = require('mysql');
const { DB_CONFIG } = require('../config');
const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');
const jwk = require('../jwks');

// [0]=idToken, [1]=accessToken
var pems = [jwkToPem(jwk.keys[0]), jwkToPem(jwk.keys[1])];

// DBに保存されたプロフィール情報を取得
exports.fetchProfile = function(req, res) {
  // 認証情報の検証
  console.log(req.query.id_token);
  jwt.verify(req.query.id_token, pems[0], function(err, decodedToken){
    if(err) res.send("error");

    const userId = decodedToken.identities[0].userId.slice(8);
    var connection = mysql.createConnection({
      host: DB_CONFIG.host,
      user: DB_CONFIG.user,
      password: DB_CONFIG.password,
      database: DB_CONFIG.database
    });

    const sql = `select * from profile where id=${userId};`
    connection.query(sql,
      function(error, result, fields) {
        if(error) throw res.end();
        console.log(result[0].id);
        res.send({
          screen_name: result[0].screen_name,
          name: result[0].name,
          picture: result[0].picture
        });
      }
    )
  });
}