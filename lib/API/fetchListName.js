/*

ユーザ名をキーに所持しているリストをリクエスト

*/

const mysql = require('mysql');
const { TWITTER_CONFIG, DB_CONFIG } = require('../../config');
const jwtVerification = require('./jwtVerification');
const Twitter = require('twitter')

exports.fetchTwitterData = function(req, res) {
  try {
    // JWTの検証
    var decoded = jwtVerification(req.query.id_token);
    const userId = decoded.identities[0].userId.slice(8);

    // 必要な情報をデータベースから取り出す
    const connection = mysql.createConnection({
      host: DB_CONFIG.host,
      user: DB_CONFIG.user,
      password: DB_CONFIG.password,
      database: DB_CONFIG.database
    });
    const sql = `select * from profile where id=${userId};`
    connection.query(sql, DBcallback);

    // DBから取得したTwitterへのアクセス情報から、TwitterAPIへ必要情報のリクエスト
    function DBcallback(error, result){
      if(error) res.end();
      const client = new Twitter({
        consumer_key: `${TWITTER_CONFIG.consumerKey}`,
        consumer_secret: `${TWITTER_CONFIG.consumerSecret}`,
        access_token_key: `${result[0].token}`,
        access_token_secret: `${result[0].secret}`
      });
      
      const params = {user_id: `${result[0].screen_name}`};
      client.get('lists/list', params, function(error, tweets){
        if(error) res.end();
        var data = [];
        tweets.forEach(element => data.push([element.name, element.slug, element.user.screen_name]));
        res.send(data);
      });
    }
  } catch(err){
    console.log(err);
    res.end();
  }
}