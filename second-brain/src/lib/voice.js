// Thin wrappers around the Web Speech API: browser-native speech-to-text
// (SpeechRecognition) and text-to-speech (speechSynthesis). No servers, no
// audio uploads — the whole voice loop runs on-device where the browser
// supports it (Chrome, Edge, Safari).

const Recognition =
  typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)

export const voiceSupported = Boolean(Recognition)
export const ttsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

// Listen for one utterance. Calls onInterim(text) as the user speaks and
// resolves with the final transcript ('' if nothing was heard).
// Returns a handle with stop() to end the capture early.
export function listen({ onInterim, onEnd }) {
  if (!Recognition) throw new Error('SpeechRecognition not supported in this browser')
  const rec = new Recognition()
  rec.lang = 'en-US'
  rec.interimResults = true
  rec.continuous = false

  let finalText = ''
  let settled = false

  const done = () => {
    if (settled) return
    settled = true
    onEnd?.(finalText.trim())
  }

  rec.onresult = (event) => {
    let interim = ''
    for (const result of event.results) {
      if (result.isFinal) finalText += result[0].transcript
      else interim += result[0].transcript
    }
    onInterim?.((finalText + interim).trim())
  }
  rec.onerror = done
  rec.onend = done
  rec.start()

  return {
    stop() {
      try {
        rec.stop()
      } catch {
        /* already stopped */
      }
    },
    abort() {
      settled = true
      try {
        rec.abort()
      } catch {
        /* already stopped */
      }
    },
  }
}

// Speak text aloud; resolves when finished (or immediately if unsupported).
export function speak(text, { rate = 1.04 } = {}) {
  if (!ttsSupported || !text) return Promise.resolve()
  return new Promise((resolve) => {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = rate
    const voices = window.speechSynthesis.getVoices()
    const preferred =
      voices.find((v) => /Google US English|Samantha|Microsoft (Aria|Jenny)/i.test(v.name)) ||
      voices.find((v) => v.lang?.startsWith('en'))
    if (preferred) utterance.voice = preferred
    utterance.onend = resolve
    utterance.onerror = resolve
    window.speechSynthesis.speak(utterance)
  })
}

export function stopSpeaking() {
  if (ttsSupported) window.speechSynthesis.cancel()
}
