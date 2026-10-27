import type { SetLog } from '../models/entities'

interface ExerciseSetRowProps {
  setLog: SetLog
  index: number
  onToggleComplete: (setLog: SetLog) => Promise<void>
  isCompleted: boolean
}

export function ExerciseSetRow({
  setLog,
  index,
  onToggleComplete,
  isCompleted,
}: ExerciseSetRowProps) {
  return (
    <div className="group-row group-row-controls">
      <span>Set {index + 1}</span>
      <input
        type="number"
        className="field"
        value={setLog.kg}
        readOnly
        placeholder="kg"
        aria-label={`Set ${index + 1} peso`}
      />
      <input
        type="number"
        className="field"
        value={setLog.repCount}
        readOnly
        placeholder="reps"
        aria-label={`Set ${index + 1} ripetizioni`}
      />
      {setLog.rpe ? <span className="nums">RPE {setLog.rpe}</span> : null}
      <button
        className="btn"
        onClick={() => onToggleComplete(setLog)}
        disabled={isCompleted}
        aria-label={isCompleted ? 'Set completato' : 'Completa set'}
        type="button"
      >
        {isCompleted ? 'Fatto' : 'Segna'}
      </button>
    </div>
  )
}
