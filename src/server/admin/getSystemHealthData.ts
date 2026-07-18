import { getEnvStatus } from "@/src/server/envStatus";

export type SystemHealthData = {
  ok: boolean;
  env: {
    total: number;
    present: number;
    status: Array<{ key: string; present: boolean }>;
  };
};

export function getSystemHealthData(): SystemHealthData {
  const env = getEnvStatus();
  return {
    ok: env.present === env.total,
    env,
  };
}
