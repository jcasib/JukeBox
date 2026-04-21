import { motion } from "framer-motion";

const bars = [1, 2, 3, 4, 5];

export default function SoundWave({ isPlaying }) {
  return (
    <div style={{ display: "flex", gap: "2px", alignItems: "end" }}>
      {bars.map((bar) => (
        <motion.div
          key={bar}
          animate={
            isPlaying
              ? {
                  scaleY: [1, 1.5, 0.5, 1.2, 1],
                }
              : { scaleY: 1 }
          }
          transition={{
            duration: 0.8,
            repeat: isPlaying ? Infinity : 0,
            delay: bar * 0.1,
          }}
          style={{
            width: "4px",
            height: "15px",
            background: "black",
            transformOrigin: "bottom",
          }}
        />
      ))}
    </div>
  );
}