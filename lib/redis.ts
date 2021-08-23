// const redis = require("redis");
import redis from "redis";
import env from "dotenv-cache";
env.config();

// redisConfig
console.log("env:", env.envCache);
let client = redis.createClient(
  Number(env.envCache.REDIS_CONFIG_PORT),
  env.envCache.REDIS_CONFIG_HOST,
  {
    password: env.envCache.REDIS_CONFIG_PASSWORD,
    db: Number(env.envCache.REDIS_CONFIG_DB),
    string_numbers: true,
  }
);

client.on("error", function (err: any) {
  console.log("Error " + err);
});
export const incrKey = (key: any) => {
  return new Promise((resolve, reject) => {
    client.incr(key, (err, replay) => {
      if (err) {
        reject(err);
      } else {
        resolve(replay);
      }
    });
  });
};
export const decrKey = (key: any) => {
  return new Promise((resolve, reject) => {
    client.decr(key, (err, replay) => {
      if (err) {
        reject(err);
      } else {
        resolve(replay);
      }
    });
  });
};
export const getKey = (key: any) => {
  return new Promise((resolve, reject) => {
    client.get(key, (err, replay) => {
      if (err) {
        reject(err);
      } else {
        resolve(replay);
      }
    });
  });
};
export const expireKey = (key: any, sec: number) => {
  return new Promise((resolve, reject) => {
    client.expire(key, sec, (err, replay) => {
      if (err) {
        reject(err);
      } else {
        resolve(replay);
      }
    });
  });
};
