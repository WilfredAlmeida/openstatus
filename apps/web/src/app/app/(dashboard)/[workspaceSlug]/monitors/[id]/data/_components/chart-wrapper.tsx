"use client";

import type { Ping, Region } from "@openstatus/tinybird";

import type { Period } from "../utils";
import { Chart } from "./chart";

export function ChartWrapper({
  data,
  period,
}: {
  data: Ping[];
  period: Period;
}) {
  const group = groupDataByTimestamp(data, period);
  return <Chart data={group.data} regions={group.regions} />;
}
/**
 *
 * @param data expects to be sorted by cronTimestamp
 * @param period
 * @returns
 */
function groupDataByTimestamp(data: Ping[], period: Period) {
  let currentTimestamp = 0;
  const regions: Partial<Record<Region, null>> = {};
  const _data = data.reduce(
    (acc, curr) => {
      const { cronTimestamp, latency, region } = curr;
      regions[region] = null; // to get the region keys
      if (cronTimestamp === currentTimestamp) {
        // overwrite last object in acc
        const last = acc.pop();
        if (last) {
          acc.push({
            ...last,
            [region]: latency,
          });
        }
      } else if (cronTimestamp) {
        currentTimestamp = cronTimestamp;
        // create new object in acc
        acc.push({
          timestamp: renderTimestamp(cronTimestamp, period),
          [region]: latency,
        });
      }
      return acc;
    },
    [] as (Partial<Record<Region, string>> & { timestamp: string })[],
  );
  return { regions: Object.keys(regions) as Region[], data: _data.reverse() };
}

/**
 * in case we need to change the format of the timestamp
 * based on the period
 * @param timestamp
 * @param period
 * @returns
 */
function renderTimestamp(timestamp: number, period: Period) {
  const isInDay = ["hour", "day"].includes(period);
  return new Date(timestamp).toLocaleString("en-US", {
    year: !isInDay ? "numeric" : undefined,
    month: !isInDay ? "numeric" : undefined,
    day: !isInDay ? "numeric" : undefined,
    hour: "2-digit",
    minute: "2-digit",
  });
}
