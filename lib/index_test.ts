import { incrKey, decrKey, getKey, expireKey } from "./redis";
import { throttleUrl } from "./index";

const preKey = "TEST_API_URL_THROTTLE";
async function throttleRequest(url: string): Promise<Function> {
  const removeThrottle = throttleUrl({
    // 接口名称，用来计数标记
    url: url,
    // 并发最大值任务数
    max: 150,
    // 每个任务最大时间，超时自动移除当前任务
    timeout: 5000,
    // 当达到并发最大值时执行
    onMax: async (i) => {
      const msg = {
        code: 500,
        error: `系统繁忙，请稍后再试，当前并发: ${i}`,
      };
      throw msg;
      // throw Error(`请稍后再试，当前并发: ${i}`);
    },
    redisConfig: {
      preKey: preKey,
      incr: incrKey,
      decr: decrKey,
      expire: expireKey,
    },
  });
  return removeThrottle;
}

async function ping(url, timeout = 2000) {
  const removeThrottle = await throttleRequest(url);

  try {
    await new Promise((res, rej) => {
      setTimeout(() => {
        if (Math.random() > 0.8) {
          rej("异步错误");
        } else {
          res(void 0);
        }
      }, timeout);
    });
  } catch (err) {
    removeThrottle();
    throw err;
  }

  removeThrottle();
  return "end";
}

import { test } from "bike/test";

test.it("超出并发150时", async (so) => {
  const url = "test";
  const array = Array.from({ length: 300 }, (i: number) => i + 1);
  for (let index = 0; index < array.length; index++) {
    ping(url).catch((err) => {
      console.log(err);
    });
  }
  setTimeout(async () => {
    so.equal(await getKey(`${preKey}_${url}`), "0");
  }, 5000);
});

test.it("请求超时测试", async (so) => {
  const url = "test2";
  const array = Array.from({ length: 300 }, (i: number) => i + 1);
  for (let index = 0; index < array.length; index++) {
    ping(url, 6000).catch((err) => {
      console.log(err);
    });
  }
  setTimeout(async () => {
    so.equal(await getKey(`${preKey}_${url}`), "0");
  }, 7000);
});
