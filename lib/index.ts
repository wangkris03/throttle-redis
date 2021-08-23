import { nanoid } from "nanoid";

// 缓存对象，用于测试或检测
export const throttleUrlCache = {} as { [url: string]: Set<string> };
export type IredisConfig = {
  preKey: string;
  incr: Function;
  decr: Function;
  expire: Function;
};
/* 限制一个 url 的并发数，返回一个remove方法，在接口执行结束时（成功或失败）调用remove方法 */
export const throttleUrl = async ({
  url,
  max,
  onMax,
  timeout,
  redisConfig,
}: {
  // 接口URL
  url: string;
  // 若遇到错误
  onMax: (size: number) => any;
  // 最大并发量
  max: number;
  // 每条任务超时自动删除
  timeout: number;
  //是否使用redis缓存
  redisConfig: IredisConfig;
}) => {
  const getRdsKey = (url: string) => {
    const key = redisConfig.preKey;
    return `${key}_${url}`;
  };
  const urlKey = getRdsKey(url);

  let count = await redisConfig.incr(urlKey);
  redisConfig.expire(urlKey, 60);

  // console.log("count1", count);

  // 根据URL初始化缓存对象
  if (!throttleUrlCache[url]) {
    throttleUrlCache[url] = new Set<string>();
  }

  // URL缓存对象
  const box = throttleUrlCache[url];

  // 任务 ID
  const id = nanoid();
  // 增加一个任务
  box.add(id);

  // 用于移除任务的方法
  const removeId = async () => {
    // console.log("removeId", i++, box.has(id));

    if (box.has(id)) {
      box.delete(id);
      const afterRemoveCount = await redisConfig.decr(urlKey);

      //   console.log("removeId count", afterRemoveCount);
    }
  };

  // 超时后，移除某个任务
  setTimeout(() => {
    // console.log("timeout");
    removeId();
  }, timeout);

  //   const size = box.size;
  const size = count;

  // 若当前任务超过最大值, 执行 onMax 并且返回, 移除方法
  if (size > max) {
    onMax(size);
    return removeId;
  }

  // redisConfig.set(urlKey, Number(await redisConfig.get(urlKey)) + 1);
  // console.log("set count", await redisConfig.get(urlKey));

  return removeId;
};
