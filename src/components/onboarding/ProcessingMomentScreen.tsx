import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

interface ProcessingMomentScreenProps {
  onComplete: () => void
  progress: number
}

export function ProcessingMomentScreen({ onComplete, progress }: ProcessingMomentScreenProps) {
  useEffect(() => {
    // Auto-advance after 1.5 seconds
    const timer = setTimeout(() => {
      onComplete()
    }, 1500)

    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div className="things-screen flex flex-col h-screen px-6 pt-12 pb-28">
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full mb-8">
        <motion.div
          className="h-full bg-blue-600 rounded-full"
          initial={{ width: `${progress - 10}%` }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Center content */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <motion.div
          className="mb-6"
          animate={{
            rotate: 360
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear'
          }}
        >
          <Loader2 className="w-16 h-16 text-blue-600" />
        </motion.div>

        <motion.h1
          className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Building your workspace...
        </motion.h1>
      </div>
    </div>
  )
}
