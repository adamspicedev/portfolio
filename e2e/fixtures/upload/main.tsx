import { createRoot } from 'react-dom/client'
import { useState } from 'react'
import { CoverUpload } from '../../../src/components/cover-upload'
import '../../../src/styles.css'
function Fixture() {
  const [cover, setCover] = useState(
    localStorage.getItem('cover') || '/images/stories/robots.webp',
  )
  const [busy, setBusy] = useState(false)
  return (
    <form
      className="cms-editor"
      onSubmit={(e) => {
        e.preventDefault()
        localStorage.setItem('cover', cover)
      }}
    >
      <label>
        Cover image URL
        <input
          aria-label="Cover image URL"
          value={cover}
          onChange={(e) => setCover(e.target.value)}
        />
      </label>
      <CoverUpload
        cover={cover}
        alt="A robot"
        disabled={false}
        onUploaded={setCover}
        onBusy={setBusy}
      />
      <label>
        Cover description (alt text)
        <input defaultValue="A robot" />
      </label>
      <button disabled={busy}>Save draft</button>
    </form>
  )
}
createRoot(document.getElementById('root')!).render(<Fixture />)
