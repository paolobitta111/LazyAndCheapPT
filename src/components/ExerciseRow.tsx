import type { FC } from 'react'

interface ExerciseRowProps {
  name: string
  sets: number
  reps: number
  weight?: string
}

export const ExerciseRow: FC<ExerciseRowProps> = ({ name, sets, reps, weight }) => (
  <div className="media is-size-6">
    <div className="media-content">
      <p className="has-text-weight-medium">{name}</p>
    </div>
    <div className="media-content has-text-right">
      <span className="tag is-light mr-1">{sets}×{reps}</span>
      {weight && <span className="tag is-dark">{weight}</span>}
    </div>
  </div>
)
