import { useState, useEffect } from 'react'
import type { FC } from 'react'

interface TimerProps {
  startedAt: string
  targetEndAt: string
}

export const Timer: FC<TimerProps> = ({ startedAt, targetEndAt }) => {
  const [now, setNow] = useState(new Date())
  const started = new Date(startedAt)
  const targetEnd = new Date(targetEndAt)
  const hasEnded = now >= targetEnd

  // Update every second for live display
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const elapsed = now >= started ? Math.floor((now.getTime() - started.getTime()) / 1000) : 0
  const remaining = targetEnd >= now ? Math.floor((targetEnd.getTime() - now.getTime()) / 1000) : 0

  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return h > 0
      ? `${h}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`
      : `${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`
  }

  return (
    <div className="box has-text-centered">
      <p className={`title is-1 ${hasEnded ? 'has-text-danger' : 'has-text-primary'}`}>
        {hasEnded ? '✅ Sessione Conclusa' : formatTime(hasEnded ? 0 : elapsed)}
      </p>
      {!hasEnded && (
        <p className="has-text-grey is-size-7">
          Target: {formatTime(remaining)} rimanenti
        </p>
      )}
      <div className="buttons mt-3">
        <button className="button is-warning is-small">⏸️ Pausa</button>
        <button className="button is-danger is-small">⏹️ Fine</button>
      </div>
    </div>
  )
}
