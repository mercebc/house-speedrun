import { useId, useState } from 'react'

function toDateInputValue(date: Date): string {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function LogCompletionForm({ now, onLog }: { now: Date; onLog: (date: Date) => void }) {
  const inputId = useId()
  const [value, setValue] = useState(() => toDateInputValue(now))

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onLog(new Date(`${value}T00:00:00.000Z`))
  }

  return (
    <form className="log-completion" onSubmit={handleSubmit}>
      <label htmlFor={inputId}>Date done</label>
      <input
        id={inputId}
        type="date"
        value={value}
        max={toDateInputValue(now)}
        onChange={(event) => setValue(event.target.value)}
      />
      <button type="submit">Log it</button>
    </form>
  )
}
