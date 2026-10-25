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
    <div className={`box mb-2 ${isCompleted ? 'has-background-success-light' : ''}`}>
      <div className="columns is-vcentered">
        <div className="column is-2">
          <span className="tag is-info is-medium">Set {index + 1}</span>
        </div>
        <div className="column is-3">
          <input
            type="number"
            className="input is-small"
            value={setLog.kg}
            readOnly
            placeholder="kg"
            aria-label={`Set ${index + 1} peso`}
          />
        </div>
        <div className="column is-3">
          <input
            type="number"
            className="input is-small"
            value={setLog.repCount}
            readOnly
            placeholder="reps"
            aria-label={`Set ${index + 1} ripetizioni`}
          />
        </div>
        <div className="column is-2">
          {setLog.rpe && (
            <span className="tag is-warning">
              RPE {setLog.rpe}
            </span>
          )}
        </div>
        <div className="column is-2">
          <button
            className={`button is-small ${isCompleted ? 'is-success' : 'is-info'}`}
            onClick={() => onToggleComplete(setLog)}
            disabled={isCompleted}
            aria-label={isCompleted ? 'Set completato' : 'Compluta set'}
          >
            {isCompleted ? '✅' : '⬜'}
          </button>
        </div>
      </div>
    </div>
  )
}
