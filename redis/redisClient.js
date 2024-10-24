const redis = require('redis');
require('dotenv').config();

const redisClient = redis.createClient({
  url: `redis://:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
});

redisClient.on('error', (err) => console.log('redis Client Error', err));

(async () => {
  await redisClient.connect();
})();

module.exports = redisClient;