import { useSelector } from 'react-redux'
import { RootState } from '../store/store'

const TaskList = () => {
  const tasks = useSelector((state: RootState) => state.tasks.tasks)

  return (
    <div>
      <h2>Tasks</h2>
      <ul>
        {tasks.map(task => (
          <li key={task.id}>{task.name}</li>
        ))}
      </ul>
    </div>
  )
}

export default TaskList
