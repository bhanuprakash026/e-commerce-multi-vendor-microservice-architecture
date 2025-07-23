// import Redis from "ioredis";

// const redis = new Redis({
//     host: process.env.REDIS_HOST || "127.0.0.1",
//     port : Number(process.env.REDIS_PORT) || 6379,
//     password: process.env.REDIS_PASSWORD,
// });

// export default redis;

import Redis from "ioredis";

const redis = new Redis("rediss://default:AbWOAAIjcDEwYjY3OTA3Y2FhOGI0YzM5ODJlMzcyODc2NWExOTE1YXAxMA@daring-rhino-46478.upstash.io:6379");
export default redis;
