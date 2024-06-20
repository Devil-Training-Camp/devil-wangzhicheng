export default function FileSelector(props: {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>
}) {
  return (
    <label htmlFor="uploader">
      <input type="file" name="uploader" onChange={props.onChange} multiple />
    </label>
  )
}
