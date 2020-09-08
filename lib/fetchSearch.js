const mysql = require('mysql');
const { TWITTER_CONFIG, DB_CONFIG } = require('../config');
const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');
const jwk = require('../jwks');
const Twitter = require('twitter');
const { query } = require('express');

// [0]=idToken, [1]=accessToken
const pems = [jwkToPem(jwk.keys[0]), jwkToPem(jwk.keys[1])];

exports.fetchSearch = function(req, res) {
  // ユーザの認証
  jwt.verify(req.query.id_token, pems[0], function(err, decodedToken){
    if(err) res.send("error");
    const userId = decodedToken.identities[0].userId.slice(8);

    // 必要な情報をデータベースから取り出す
    var connection = mysql.createConnection({
      host: DB_CONFIG.host,
      user: DB_CONFIG.user,
      password: DB_CONFIG.password,
      database: DB_CONFIG.database
    });

    const sql = `select * from profile where id=${userId};`
    connection.query(sql,
      async function(error, result, fields) {
        if(error) throw res.end();
        console.log("Search");

        // TwitterAPIへのリクエスト
        const client = new Twitter({
          consumer_key: `${TWITTER_CONFIG.consumerKey}`,
          consumer_secret: `${TWITTER_CONFIG.consumerSecret}`,
          access_token_key: `${result[0].token}`,
          access_token_secret: `${result[0].secret}`
        });

        // リクエストステータス
        var url = [];
        var nextCursor, count = 0;

        function requester(client, url, nextCursor, count, slug, nextParams){
          // ページング処理
          if(nextCursor){
            var params = {q: slug + " filter:images exclude:retweets", count: 100, max_id: nextCursor};
          }else{
            var params = {q: slug+ " filter:images exclude:retweets", count: 100};
          }
        
          if(nextParams){
            var params = nextParams;
          }
        
          // tweetをリクエスト
          console.log("params", params)
          client.get('search/tweets', params, async function(error, tweets, response) {
            // リクエスト内容から画像urlを抽出
            var data = [];
            tweets.statuses.forEach(element => data.push([element.extended_entities]))
            if(data.length > 0){
              data.forEach(element => 
                {
                  if(element[0].media.length == 1){
                    url.push(element[0].media[0].media_url)
                  }else if(element[0].media.length > 1){
                    element[0].media.forEach(innerElement => url.push(innerElement.media_url))
                  }
                }
              )
            }
        
            // 十分数取得できていなければ次のページをリクエスト
            console.log(url)
            console.log("nextCursor", tweets.search_metadata.max_id_str);
            nextCursor = tweets.search_metadata.max_id_str;
            console.log("urlLength", url.length)
            count+=1;
            console.log("count", count)
            var nextResult = String(tweets.search_metadata.next_results)
            if(nextResult==='undefined'){
              console.log("tweets", tweets)
              console.log("sending", url)
              res.send(url);

            }else{
              nextResult = nextResult.slice(1)
              nextResult = JSON.parse('{"' + decodeURI(nextResult).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"').replace(/\s/g,'') + '"}')
              console.log("nextResult", nextResult);
              if(count < 2 && url.length < 5){
                await requester(client, url, nextCursor, count, slug, nextResult)
              }else{
                console.log("sending", url)
                res.send(url);
              }
            }
          });
        }

        requester(client, url, nextCursor, count, req.query.q)
      }
    )
  });
}