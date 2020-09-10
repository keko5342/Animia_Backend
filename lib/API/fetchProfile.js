/*

DBに保存しているユーザプロフィールをリクエスト

*/

const mysql = require('mysql');
const { DB_CONFIG } = require('../../config');
const jwtVerification = require('./jwtVerification');

exports.fetchProfile = function(req, res) {
  try {
    // 認証情報の検証
    var decoded = jwtVerification(req.query.id_token);
    const userId = decoded.identities[0].userId.slice(8);

    // DBからプロフィール情報を取得
    var connection = mysql.createConnection({
      host: DB_CONFIG.host,
      user: DB_CONFIG.user,
      password: DB_CONFIG.password,
      database: DB_CONFIG.database
    });
    const sql = `select * from profile where id=${userId};`

    connection.query(sql, function(error, result) {
      if(error) throw res.end();

      res.send({
        screen_name: result[0].screen_name,
        name: result[0].name,
        picture: result[0].picture
      });
    })
  } catch(err) {
    console.log(err)
    res.end();
  }
}