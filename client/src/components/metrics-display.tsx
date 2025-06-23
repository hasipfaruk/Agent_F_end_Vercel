import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { type Agent } from "@shared/schema";
import { motion } from "framer-motion";
import { Activity, Zap, Trophy } from "lucide-react";

interface MetricsDisplayProps {
  agents: Agent[];
}

export default function MetricsDisplay({ agents }: MetricsDisplayProps) {
  const data = agents.map(agent => ({
    name: agent.name,
    requests: agent.metrics && (agent.metrics as any).requests_handled !== undefined ? (agent.metrics as any).requests_handled : 0,
    success: agent.metrics && (agent.metrics as any).success_rate !== undefined ? (agent.metrics as any).success_rate : 100,
    response_time: agent.metrics && (agent.metrics as any).avg_response_time !== undefined ? (agent.metrics as any).avg_response_time : 0
  }));

  const totalRequests = data.reduce((sum, item) => sum + (item.requests || 0), 0);
  const avgSuccess = data.reduce((sum, item) => sum + (item.success || 0), 0) / (data.length || 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="col-span-3 bg-gradient-to-br from-background to-secondary/5">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Performance Metrics
            </h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-transparent"
            >
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Total Requests</span>
              </div>
              <motion.p 
                className="text-2xl font-bold mt-2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
              >
                {totalRequests}
              </motion.p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-transparent"
            >
              <div className="flex items-center space-x-2">
                <Trophy className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Average Success Rate</span>
              </div>
              <motion.p 
                className="text-2xl font-bold mt-2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5, delay: 0.1 }}
              >
                {avgSuccess.toFixed(1)}%
              </motion.p>
            </motion.div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="requests" 
                    stroke="hsl(var(--primary))"
                    fillOpacity={1}
                    fill="url(#colorRequests)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="success" 
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
