interface ProgressParams {
  ratio: number
  className?: string
}

export default function Progress({ ratio, className }: ProgressParams) {
  return (
    <div className={['bg-white/30 h-1 rounded-sm', className].join(' ')}>
      <div
        style={{ width: `${ratio * 100}%` }}
        className="h-full rounded-sm bg-white"
      ></div>
    </div>
  )
}
