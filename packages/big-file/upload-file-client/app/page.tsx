import Image from 'next/image'

export default function Home() {
  const a = 'hello world'
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <label htmlFor="uploader">
        <input type="file" name={'uploader'} />
      </label>
    </main>
  )
}