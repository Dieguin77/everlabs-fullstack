import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { addTask } from '../store/slices/tasksSlice'

const AddTask = () => {
  const [taskName, setTaskName] = useState('')
  const dispatch = useDispatch()

  const handleAddTask = () => {
    if (taskName.trim() === '') return

    dispatch(addTask({
      id: new Date().toISOString(),
      name: taskName,
      description: '',
      status: 'todo',
    }))

    setTaskName('')
  }

  return (
    <div>
      <input 
        type="text" 
        value={taskName} 
        onChange={(e) => setTaskName(e.target.value)} 
      />
      <button onClick={handleAddTask}>Add Task</button>
    </div>
  )
}

export default AddTask
