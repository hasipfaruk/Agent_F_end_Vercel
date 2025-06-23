import { motion, AnimatePresence } from "framer-motion";
import { type DigitalTwin } from "@shared/schema";

interface TwinTransitionProps {
  currentTwin: DigitalTwin | null;
  isTransitioning: boolean;
  onTransitionComplete?: () => void;
}

export function TwinTransition({ currentTwin, isTransitioning, onTransitionComplete }: TwinTransitionProps) {
  return (
    <AnimatePresence mode="wait" onExitComplete={onTransitionComplete}>
      {currentTwin && (
        <motion.div
          key={currentTwin.id}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            y: 0,
            transition: { 
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1], // Custom easing curve for smoother animation
              staggerChildren: 0.1 // Stagger child animations
            }
          }}
          exit={{ 
            opacity: 0, 
            scale: 0.95,
            y: -20,
            transition: { 
              duration: 0.4,
              ease: [0.22, 1, 0.36, 1]
            }
          }}
          className={`w-full h-full flex flex-col items-center justify-center space-y-6
            ${isTransitioning ? 'pointer-events-none' : ''}`}
        >
          <motion.div
            className="relative w-32 h-32"
            layoutId={`twin-avatar-${currentTwin.id}`}
            transition={{
              layout: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full rounded-full overflow-hidden border-4 border-primary/20 shadow-lg"
            >
              <img
                src={currentTwin.avatar}
                alt={`${currentTwin.name}'s avatar`}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </motion.div>

          <motion.div
            className="text-center space-y-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <motion.h2
              className="text-2xl font-bold text-primary"
              layoutId={`twin-name-${currentTwin.id}`}
            >
              {currentTwin.name}
            </motion.h2>

            <motion.p
              className="text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {currentTwin.type}
            </motion.p>

            <motion.div
              className="flex flex-wrap gap-2 justify-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              {currentTwin.capabilities.map((capability, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1,
                    transition: { delay: index * 0.1 } 
                  }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="px-3 py-1 bg-primary/10 rounded-full text-sm font-medium text-primary/80"
                >
                  {capability}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}