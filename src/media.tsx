import { useEffect, useRef, useState } from 'react'

type LocalMedia = { file: Blob; kind: 'image' | 'audio'; label: string }

export function FileMedia({ file, kind, label }: LocalMedia) {
  const [url, setUrl] = useState('')
  useEffect(() => {
    const objectUrl = URL.createObjectURL(file)
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])
  if (!url) return null
  return kind === 'image'
    ? <img className="card-media" src={url} alt={label} />
    : <audio className="card-audio" controls preload="metadata" src={url} aria-label={label} />
}

export function Pronunciation({ id, text, language }: { id: string; text: string; language: string }) {
  const [notice, setNotice] = useState('')
  const audio = useRef<HTMLAudioElement>(null)

  useEffect(() => () => {
    window.speechSynthesis?.cancel?.()
  }, [])

  async function play() {
    setNotice('')
    if (audio.current) {
      try {
        audio.current.currentTime = 0
        await audio.current.play()
        return
      } catch {
        // Use a local browser voice if the recording is unavailable.
      }
    }
    const engine = window.speechSynthesis
    const voice = engine?.getVoices().find(item => item.localService && item.lang.split('-')[0] === language)
    if (!voice || !text) {
      setNotice('Pronúncia indisponível neste navegador. Você pode anexar um áudio à sua carta.')
      return
    }
    const reading = new SpeechSynthesisUtterance(text)
    reading.voice = voice
    reading.lang = voice.lang
    reading.onerror = () => setNotice('O navegador não conseguiu reproduzir a pronúncia.')
    engine.cancel()
    engine.speak(reading)
  }

  if (!text) return null
  return <div className="pronunciation">
    {!id.startsWith('custom-') && <audio ref={audio} preload="none" src={`${import.meta.env.BASE_URL}audio/${id}.mp3`} />}
    <button type="button" className="button secondary" onClick={() => void play()}>Ouvir pronúncia</button>
    {notice && <p role="status">{notice}</p>}
  </div>
}

export const mediaLimits = {
  image: { accept: 'image/jpeg,image/png,image/webp,image/gif', max: 5 * 1024 ** 2 },
  audio: { accept: 'audio/mpeg,audio/mp4,audio/ogg,audio/wav,audio/x-wav,audio/webm', max: 15 * 1024 ** 2 },
}

export function getMedia(fields: FormData, key: string, kind: keyof typeof mediaLimits, previous?: Blob) {
  const file = fields.get(key)
  if (file instanceof File && file.size) {
    const config = mediaLimits[kind]
    if (!config.accept.split(',').includes(file.type)) throw new Error('Escolha um formato de imagem ou áudio aceito.')
    if (file.size > config.max) throw new Error(kind === 'image' ? 'Cada imagem pode ter até 5 MB.' : 'Cada áudio pode ter até 15 MB.')
    return file
  }
  return fields.has(`remove-${key}`) ? undefined : previous
}
