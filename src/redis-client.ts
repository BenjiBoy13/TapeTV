import * as redis from 'redis';

const redisClient = redis.createClient();

redisClient.connect().then(res => console.log(`Redis Service up and running`));
export default redisClient;