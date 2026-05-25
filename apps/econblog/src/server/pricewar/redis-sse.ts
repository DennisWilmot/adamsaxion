import { createClient } from "redis";
import { isRedisSSEEnabled, matchEventChannel } from "./sse-channels";

type RedisConnection = {
  isOpen: boolean;
  connect(): Promise<unknown>;
  publish(channel: string, message: string): Promise<number>;
  subscribe(channel: string, listener: (message: string) => void): Promise<unknown>;
  unsubscribe(channel: string): Promise<unknown>;
  quit(): Promise<unknown>;
  on(event: string, listener: (err: Error) => void): void;
};

const globalForRedis = globalThis as typeof globalThis & {
  pricewarRedisPublisher?: RedisConnection;
};

function redisUrl(): string {
  const url = process.env.REDIS_URL?.trim();
  if (!url) throw new Error("REDIS_URL is not configured");
  return url;
}

function createRedisConnection(): RedisConnection {
  const client = createClient({ url: redisUrl() });
  client.on("error", (err) => {
    console.error("[pricewar redis]", err);
  });
  return client as unknown as RedisConnection;
}

export async function getRedisPublisher(): Promise<RedisConnection | null> {
  if (!isRedisSSEEnabled()) return null;

  const existing = globalForRedis.pricewarRedisPublisher;
  if (existing?.isOpen) return existing;

  const client = createRedisConnection();
  await client.connect();
  globalForRedis.pricewarRedisPublisher = client;
  return client;
}

export async function createRedisSubscriber(): Promise<RedisConnection> {
  const client = createRedisConnection();
  await client.connect();
  return client;
}

export async function publishMatchEventJson(matchId: string, payload: string): Promise<void> {
  const publisher = await getRedisPublisher();
  if (!publisher) return;
  await publisher.publish(matchEventChannel(matchId), payload);
}

export async function subscribeMatchEventJson(
  matchId: string,
  onMessage: (payload: string) => void
): Promise<() => void> {
  const subscriber = await createRedisSubscriber();
  const channel = matchEventChannel(matchId);

  await subscriber.subscribe(channel, (message) => {
    onMessage(message);
  });

  return () => {
    void subscriber
      .unsubscribe(channel)
      .then(() => subscriber.quit())
      .catch(() => {
        // stream already closed
      });
  };
}
