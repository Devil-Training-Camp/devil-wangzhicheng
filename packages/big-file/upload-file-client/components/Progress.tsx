interface ProgressParams {
  ratio: number
}
export default function Progress({ ratio }: ProgressParams) {
  return (
    <div className="w-full bg-white/30 h-1 rounded-sm">
      <div className={`"w-[${ratio * 100}%] h-full rounded-sm bg-white"`}></div>
    </div>
  )
}
