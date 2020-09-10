const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');
const jwk = require('../../certs/jwks');

function jwtVerification(idToken){
  // [0]=idToken, [1]=accessToken
  const pems = [jwkToPem(jwk.keys[0]), jwkToPem(jwk.keys[1])];
  return(jwt.verify(idToken, pems[0]));
}

module.exports = jwtVerification;