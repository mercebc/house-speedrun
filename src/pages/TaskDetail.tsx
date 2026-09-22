import { useParams } from 'react-router-dom'

export function TaskDetail() {
  const { taskId } = useParams<{ taskId: string }>()

  return (
    <section>
      <h1>Task detail</h1>
      <p>{taskId}</p>
    </section>
  )
}
