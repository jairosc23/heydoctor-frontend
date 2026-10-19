"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type RequestsPoint = {
  minute: string;
  count: number;
};

export function OpsRequestsChart({ data }: { data: RequestsPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="minute" tick={{ fontSize: 10 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
        <Tooltip />
        <Bar dataKey="count" fill="#0ea5e9" name="Requests" />
      </BarChart>
    </ResponsiveContainer>
  );
}
