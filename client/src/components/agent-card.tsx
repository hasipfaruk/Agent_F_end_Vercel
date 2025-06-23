import { type Agent } from "@shared/schema";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Activity, Cpu, Brain } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface AgentCardProps {
  agent: Agent;
}

export default function AgentCard({ agent }: AgentCardProps) {
  const [prevStatus, setPrevStatus] = useState(agent.status);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);

  useEffect(() => {
    if (prevStatus !== agent.status) {
      // Create particles on status change
      const newParticles = Array.from({ length: 10 }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 100 - 50,
        y: Math.random() * 100 - 50,
      }));
      setParticles(newParticles);
      setPrevStatus(agent.status);

      // Clear particles after animation
      setTimeout(() => setParticles([]), 1000);
    }
  }, [agent.status, prevStatus]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      className="relative"
    >
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{ scale: 0, x: 0, y: 0 }}
            animate={{
              scale: [1, 0],
              x: particle.x,
              y: particle.y,
              opacity: [1, 0],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute w-2 h-2 rounded-full bg-primary/50"
            style={{ top: "50%", left: "50%" }}
          />
        ))}
      </AnimatePresence>

      <Card className="w-full bg-gradient-to-br from-background to-secondary/10 border-2 hover:border-primary/50 transition-all">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <motion.div
              animate={{ rotate: agent.status === "active" ? 360 : 0 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Bot className="h-5 w-5 text-primary" />
            </motion.div>
            <h3 className="font-semibold text-lg bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {agent.name}
            </h3>
          </div>
          <motion.div
            animate={{
              scale: agent.status === "active" ? [1, 1.1, 1] : 1,
            }}
            transition={{ repeat: agent.status === "active" ? Infinity : 0, duration: 2 }}
          >
            <Badge 
              variant={agent.status === "active" ? "default" : "secondary"}
              className="font-medium relative overflow-hidden"
            >
              <motion.div
                animate={{
                  x: agent.status === "active" ? ["0%", "100%"] : "0%",
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              />
              <span className="relative z-10">{agent.status}</span>
            </Badge>
          </motion.div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <motion.div 
              className="flex justify-center"
              whileHover={{ rotate: [0, -5, 5, 0], transition: { duration: 0.5 } }}
            >
              <Avatar className="h-24 w-24 ring-2 ring-primary/20">
                <AvatarImage src={agent.avatar} alt="Agent avatar" />
                <AvatarFallback>
                  <User className="h-12 w-12" />
                </AvatarFallback>
              </Avatar>
            </motion.div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {agent.capabilities.map((capability, index) => (
                  <motion.div
                    key={capability}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-1 text-sm text-muted-foreground"
                  >
                    {index % 2 === 0 ? <Cpu className="h-3 w-3" /> : <Brain className="h-3 w-3" />}
                    <span>{capability}</span>
                  </motion.div>
                ))}
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Performance Metrics</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    Requests: {agent.metrics && (agent.metrics as any).requests_handled !== undefined ? (agent.metrics as any).requests_handled : 0}
                  </motion.div>
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                  >
                    Success: {agent.metrics && (agent.metrics as any).success_rate !== undefined ? (agent.metrics as any).success_rate : 100}%
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
