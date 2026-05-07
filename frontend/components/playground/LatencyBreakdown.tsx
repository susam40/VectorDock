"use client";

import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import type { PlaygroundResponse } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
];

export function LatencyBreakdown({
  data,
}: {
  data: PlaygroundResponse["latencyBreakdown"];
}) {
  const totalSeconds = (data.total / 1000).toFixed(2);
  const chartData = [
    { name: "Gömme", value: data.embedding },
    { name: "Geri getirme", value: data.retrieval },
    { name: "Yeniden sıralama", value: data.reranking },
    { name: "LLM", value: data.llm },
  ].filter((d) => d.value > 0);

  return (
    <Card>
      <CardHeader className="pb-0">
        <CardTitle className="text-base">Gecikme dağılımı</CardTitle>
      </CardHeader>
      <CardContent className="h-64 pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={48}
              outerRadius={72}
              paddingAngle={2}
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v) => [`${Number(v ?? 0)} ms`, ""]}
              contentStyle={{
                borderRadius: 8,
                border: "1px solid var(--color-border)",
                background: "var(--color-card)",
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        <p className="text-muted-foreground text-center text-xs">
          Toplam {totalSeconds} sn
        </p>
      </CardContent>
    </Card>
  );
}
