import { usePostHog } from 'posthog-js/react'
import { reportHandledError } from '../lib/client-telemetry'
import { useEffect, useRef, useState } from 'react'
import { safeContentUrl } from '../lib/story-schema'

export function CoverUpload({
  contentLabel = 'story',
  cover,
  alt,
  disabled,
  onUploaded,
  onBusy,
}: {
  contentLabel?: 'story' | 'project'
  cover: string
  alt: string
  disabled: boolean
  onUploaded: (url: string) => void
  onBusy: (busy: boolean) => void
}) {
  const posthog = usePostHog()
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const active = useRef<XMLHttpRequest | null>(null)
  const mounted = useRef(true)
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      active.current?.abort()
    }
  }, [])
  function upload(file: File | undefined) {
    if (!file || busy || disabled) return
    setError('')
    setMessage('')
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Choose a JPEG, PNG or WebP image.')
      return
    }
    if (!file.size || file.size > 3 * 1024 * 1024) {
      setError('Choose a non-empty image up to 3 MB.')
      return
    }
    setBusy(true)
    onBusy(true)
    setProgress(0)
    const xhr = new XMLHttpRequest()
    active.current = xhr
    xhr.open('POST', '/api/story-images')
    xhr.timeout = 120_000
    const finish = () => {
      active.current = null
      if (mounted.current) {
        setBusy(false)
        onBusy(false)
      }
    }
    xhr.upload.onprogress = (e) => {
      if (mounted.current && e.lengthComputable)
        setProgress(Math.round((e.loaded / e.total) * 100))
    }
    xhr.onerror = xhr.ontimeout = (event) => {
      reportHandledError(posthog, event, 'cover_upload')
      if (mounted.current)
        setError(
          'Upload interrupted. Check your connection and sign-in, then choose the image again.',
        )
      finish()
    }
    xhr.onabort = finish
    xhr.onload = () => {
      if (mounted.current) {
        try {
          const result = JSON.parse(xhr.responseText)
          if (
            xhr.status === 201 &&
            typeof result.url === 'string' &&
            result.url.startsWith('https://')
          ) {
            onUploaded(result.url)
            setMessage(
              `Cover uploaded. Add a description and save the ${contentLabel} to use it.`,
            )
          } else
            setError(
              typeof result.message === 'string'
                ? result.message
                : 'Unable to upload. Your existing cover is unchanged. Choose the image again.',
            )
        } catch (error) {
          // Expected non-success responses (including authorization) are not exceptions.
          if (xhr.status >= 200 && xhr.status < 300)
            reportHandledError(posthog, error, 'cover_upload')
          setError(
            'Unable to upload. Check your connection and sign-in, then choose the image again.',
          )
        }
      }
      finish()
    }
    const data = new FormData()
    data.set('file', file)
    xhr.send(data)
  }
  return (
    <div className="cms-cover-upload">
      <label>
        Upload cover
        <input
          type="file"
          aria-label="Upload cover"
          accept="image/jpeg,image/png,image/webp"
          disabled={disabled || busy}
          onChange={(e) => {
            const file = e.currentTarget.files?.[0]
            e.currentTarget.value = ''
            upload(file)
          }}
        />
      </label>
      <p className="text-sm text-muted">
        JPEG, PNG or WebP · up to 3 MB and 25 megapixels. Uploaded images are
        public to anyone with their URL, even before the {contentLabel} is
        published.
      </p>
      {busy && (
        <>
          <progress
            aria-label="Cover upload progress"
            value={progress}
            max={100}
          />
          <output>
            {progress < 100
              ? `Uploading cover… ${progress}%`
              : 'Storing cover…'}
          </output>
        </>
      )}
      {!busy && message && <output>{message}</output>}
      {error && (
        <p role="alert" className="cms-notice">
          {error}
        </p>
      )}
      {safeContentUrl(cover) && (
        <img
          src={safeContentUrl(cover)}
          alt={alt}
          className="cms-cover-preview"
        />
      )}
    </div>
  )
}
