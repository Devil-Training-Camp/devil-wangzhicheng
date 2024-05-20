interface ProgressParams {
  ratio: number
}

export default function Progress({ ratio }: ProgressParams) {
  return (
    <div className="w-full bg-white/30 h-1 rounded-sm">
      <div
        style={{ width: `${ratio * 100}%` }}
        className="h-full rounded-sm bg-white"
      ></div>
    </div>
  )
}
