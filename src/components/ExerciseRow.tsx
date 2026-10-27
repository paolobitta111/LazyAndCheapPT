import type { FC } from 'react'

interface ExerciseRowProps {
  name: string
  sets: number
  reps: number
  weight?: string
}

export const ExerciseRow: FC<ExerciseRowProps> = ({ name, sets, reps, weight }) => (
  <div className="group-row">
    <p>{name}</p>
    <span className="nums">{sets}×{reps}</span>
    {weight ? <span className="nums">{weight}</span> : null}
  </div>
)
