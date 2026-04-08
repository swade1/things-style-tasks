import { Reorder, useDragControls } from 'framer-motion'
import { TaskRow } from './TaskRow'
import type { Task } from '@/types'

interface ReorderableTaskItemProps {
  task: Task
  onToggle: (taskId: string) => void
  onClick: (taskId: string) => void
  onDelete?: (taskId: string) => void
}

export function ReorderableTaskItem({ task, onToggle, onClick, onDelete }: ReorderableTaskItemProps) {
  const dragControls = useDragControls()

  return (
    <Reorder.Item
      value={task}
      drag="y"
      dragListener={false}
      dragControls={dragControls}
      className="list-none"
      whileDrag={{ scale: 1.01, zIndex: 10 }}
    >
      <TaskRow
        task={task}
        onToggle={onToggle}
        onClick={onClick}
        onDelete={onDelete}
        onReorderStart={(event) => dragControls.start(event)}
      />
    </Reorder.Item>
  )
}
