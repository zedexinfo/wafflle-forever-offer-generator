'use client';

import { motion } from 'framer-motion';

export default function WaffleLogo({ className = "", size = "large" }: { className?: string, size?: "small" | "medium" | "large" }) {
  const sizeClasses = {
    small: "w-16 h-16",
    medium: "w-24 h-24", 
    large: "w-32 h-32"
  };

  const textSizes = {
    small: "text-lg",
    medium: "text-2xl",
    large: "text-4xl"
  };

  return (
    <motion.div
      className={`relative flex flex-col items-center ${className}`}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 260, 
        damping: 20,
        duration: 0.8
      }}
    >
      {/* Sparkle Effects */}
      <motion.div
        className="absolute -top-4 -left-4 text-yellow-400 text-xl"
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
          opacity: [1, 0.7, 1]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        ✨
      </motion.div>
      
      <motion.div
        className="absolute -top-2 -right-6 text-yellow-300 text-sm"
        animate={{
          scale: [1, 1.3, 1],
          rotate: [0, -180, -360],
          opacity: [1, 0.5, 1]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5
        }}
      >
        ⭐
      </motion.div>

      <motion.div
        className="absolute -bottom-2 -left-6 text-orange-400 text-sm"
        animate={{
          scale: [1, 1.1, 1],
          y: [0, -5, 0],
          opacity: [1, 0.8, 1]
        }}
        transition={{
          duration: 2.2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      >
        💫
      </motion.div>

      {/* Main Logo Container */}
      <motion.div
        className={`relative ${sizeClasses[size]} mb-4`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Red Cape Background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-red-500 to-red-600 rounded-full transform scale-110"
          animate={{
            boxShadow: [
              "0 0 20px rgba(239, 68, 68, 0.3)",
              "0 0 40px rgba(239, 68, 68, 0.5)",
              "0 0 20px rgba(239, 68, 68, 0.3)"
            ]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Waffle Character */}
        <motion.div
          className="relative z-10 w-full h-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-500 rounded-lg shadow-lg flex items-center justify-center transform rotate-3"
          animate={{
            rotate: [3, -3, 3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {/* Waffle Grid Pattern */}
          <div className="absolute inset-2 grid grid-cols-3 grid-rows-3 gap-1">
            {[...Array(9)].map((_, i) => (
              <motion.div
                key={i}
                className="bg-amber-600 rounded-sm"
                initial={{ opacity: 0.7 }}
                animate={{
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.1
                }}
              />
            ))}
          </div>

          {/* Eyes */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex gap-2 mb-2">
              <motion.div
                className="w-2 h-2 bg-black rounded-full"
                animate={{
                  scaleY: [1, 0.1, 1]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div
                className="w-2 h-2 bg-black rounded-full"
                animate={{
                  scaleY: [1, 0.1, 1]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
          </div>

          {/* Smile */}
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-4 h-2 border-b-2 border-black rounded-full" />
        </motion.div>

        {/* Crown */}
        <motion.div
          className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-20"
          animate={{
            y: [0, -3, 0],
            rotate: [0, 2, -2, 0]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="relative">
            {/* Crown Base */}
            <div className="w-12 h-4 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 rounded-sm shadow-lg" />
            
            {/* Crown Points */}
            <div className="absolute -top-2 left-0 w-full flex justify-between">
              <div className="w-2 h-3 bg-gradient-to-t from-yellow-500 to-yellow-300 rounded-t-full" />
              <div className="w-2 h-4 bg-gradient-to-t from-yellow-500 to-yellow-300 rounded-t-full" />
              <div className="w-2 h-3 bg-gradient-to-t from-yellow-500 to-yellow-300 rounded-t-full" />
            </div>
            
            {/* Crown Jewels */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className={`absolute top-0 w-1 h-1 rounded-full ${
                  i === 1 ? 'bg-red-500 left-1/2 transform -translate-x-1/2' : 
                  i === 0 ? 'bg-blue-500 left-1' : 'bg-green-500 right-1'
                }`}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [1, 0.7, 1]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.2
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Scepter */}
        <motion.div
          className="absolute -right-8 top-1/2 transform -translate-y-1/2 z-20"
          animate={{
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {/* Scepter Staff */}
          <div className="w-1 h-12 bg-gradient-to-b from-amber-600 to-amber-700 rounded-full" />
          
          {/* Scepter Top */}
          <motion.div
            className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full border border-yellow-600"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      </motion.div>

      {/* Text Logo */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <motion.h1
          className={`font-bold bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent ${textSizes[size]} leading-tight`}
          animate={{
            backgroundPosition: ["0%", "100%", "0%"]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            backgroundSize: "200% 100%"
          }}
        >
          WAFFLE
        </motion.h1>
        
        <motion.div
          className={`font-semibold text-orange-800 -mt-1 ${size === 'large' ? 'text-lg' : size === 'medium' ? 'text-sm' : 'text-xs'}`}
          animate={{
            color: ["#9a3412", "#ea580c", "#9a3412"]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          FOREVER
        </motion.div>
      </motion.div>

      {/* Glow Effect */}
      <motion.div
        className="absolute inset-0 -z-10 rounded-full opacity-20"
        animate={{
          background: [
            "radial-gradient(circle, rgba(251, 191, 36, 0.3) 0%, transparent 70%)",
            "radial-gradient(circle, rgba(234, 88, 12, 0.3) 0%, transparent 70%)",
            "radial-gradient(circle, rgba(251, 191, 36, 0.3) 0%, transparent 70%)"
          ]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </motion.div>
  );
}