import { useState } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { RefreshCw } from 'lucide-react'

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: React.ReactNode
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const y = useMotionValue(0)
  const rotate = useTransform(y, [0, 80], [0, 360])
  const opacity = useTransform(y, [0, 40, 80], [0, 0.5, 1])

  const handleDragEnd = async (_event: any, info: any) => {
    if (info.offset.y > 80 && !isRefreshing) {
      setIsRefreshing(true)
      await onRefresh()
      setIsRefreshing(false)
      y.set(0)
    } else {
      y.set(0)
    }
  }

  return (
    <div className="relative overflow-hidden">
      {/* Refresh indicator */}
      <motion.div
        className="absolute top-0 left-0 right-0 flex items-center justify-center z-10"
        style={{
          y: useTransform(y, (value) => Math.min(value - 40, 0)),
          opacity
        }}
      >
        <motion.div
          className="bg-white rounded-full p-2 shadow-lg"
          style={{ rotate }}
        >
          <RefreshCw
            size={20}
            className={isRefreshing ? 'animate-spin text-blue-600' : 'text-gray-600'}
          />
        </motion.div>
      </motion.div>

      {/* Draggable content */}
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.3}
        onDragEnd={handleDragEnd}
        style={{ y }}
        className={isRefreshing ? 'pointer-events-none' : ''}
      >
        {children}
      </motion.div>
    </div>
  )
}
