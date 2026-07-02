import { useEffect, useMemo, useRef, useState } from 'react'
import { askBrain, localAnswer, speakableText, DEFAULT_MODEL, MODELS } from '../lib/brain.js'
import { listen, speak, stopSpeaking, voiceSupported, ttsSupported } from '../lib/voice.js'
import { renderMarkdown } from '../lib/markdown.js'

const SUGGESTIONS = [
  'Who is Pratham?',
  'What has he built?',
  'What is he learning right now?',
  'Summarize his work experience',
]

function loadSetting(key, fallback) {
  try {
    return localStorage.getItem(key) ?? fallback
  } catch {
    return fallback
  }
}

export default function Ask({ vault, onOpenNote }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [status, setStatus] = useState('idle') // idle | listening | thinking | speaking
  const [voiceMode, setVoiceMode] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [apiKey, setApiKey] = useState(() => loadSetting('prat-brain.api-key', ''))
  const [model, setModel] = useState(() => loadSetting('prat-brain.model', DEFAULT_MODEL))
  const [speakReplies, setSpeakReplies] = useState(() => loadSetting('prat-brain.speak', '1') === '1')

  const voiceModeRef = useRef(voiceMode)
  voiceModeRef.current = voiceMode
  // send() can be invoked from speech callbacks captured on an earlier
  // render — read conversation state through refs so history stays fresh.
  const messagesRef = useRef(messages)
  messagesRef.current = messages
  const recognitionRef = useRef(null)
  const scrollRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, status])

  useEffect(() => () => {
    recognitionRef.current?.abort()
    stopSpeaking()
  }, [])

  function saveSetting(key, value) {
    try {
      localStorage.setItem(key, value)
    } catch {
      /* private mode */
    }
  }

  async function send(question) {
    const q = question.trim()
    if (!q || status === 'thinking') return
    setInput('')
    setStatus('thinking')

    const history = messagesRef.current
      .filter((m) => m.text.trim())
      .map(({ role, text }) => ({ role, text }))
    setMessages((m) => [...m, { role: 'user', text: q }, { role: 'assistant', text: '', pending: true }])

    let result
    try {
      if (apiKey) {
        result = await askBrain({
          vault,
          question: q,
          history,
          apiKey,
          model,
          onDelta: (delta) =>
            setMessages((m) => {
              const next = [...m]
              const last = next[next.length - 1]
              next[next.length - 1] = { ...last, text: last.text + delta }
              return next
            }),
        })
      } else {
        result = localAnswer(vault, q)
      }
    } catch (err) {
      result = {
        text: `Something went wrong talking to the API: ${err?.message || err}. Check the API key in ⚙ settings.`,
        sources: [],
      }
    }

    setMessages((m) => {
      const next = [...m]
      next[next.length - 1] = { role: 'assistant', text: result.text, sources: result.sources }
      return next
    })

    const shouldSpeak = (voiceModeRef.current || speakReplies) && ttsSupported
    if (shouldSpeak) {
      setStatus('speaking')
      await speak(speakableText(result.text))
    }
    if (voiceModeRef.current) startListening()
    else setStatus('idle')
  }

  function startListening() {
    if (!voiceSupported) return
    stopSpeaking()
    setStatus('listening')
    setInput('')
    recognitionRef.current = listen({
      onInterim: (text) => setInput(text),
      onEnd: (finalText) => {
        recognitionRef.current = null
        if (finalText) {
          send(finalText)
        } else if (voiceModeRef.current) {
          // Heard nothing — leave voice mode instead of looping forever.
          setVoiceMode(false)
          setStatus('idle')
        } else {
          setStatus('idle')
        }
      },
    })
  }

  function toggleVoiceMode() {
    if (voiceMode) {
      setVoiceMode(false)
      recognitionRef.current?.abort()
      stopSpeaking()
      setStatus('idle')
    } else {
      setVoiceMode(true)
      voiceModeRef.current = true
      startListening()
    }
  }

  function micOnce() {
    if (status === 'listening') {
      recognitionRef.current?.stop()
    } else {
      startListening()
    }
  }

  const statusLabel = {
    listening: '🎙 listening… speak now',
    thinking: apiKey ? '🧠 thinking…' : '🧠 searching notes…',
    speaking: '🔊 speaking… (click ⏹ to stop)',
  }[status]

  return (
    <div className="ask">
      <div className="ask-scroll" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="ask-empty">
            <h1>ask the brain</h1>
            <p>
              Chat with everything in this second brain — {vault.notes.length} notes on Pratham's
              experience, projects, and ideas.
              {voiceSupported && ' Or press the mic and just talk to it.'}
            </p>
            <div className="ask-suggestions">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)}>
                  {s}
                </button>
              ))}
            </div>
            {!apiKey && (
              <p className="ask-note">
                Running in local mode. Add a Claude API key in <b>⚙ settings</b> for full answers —
                the key stays in your browser.
              </p>
            )}
          </div>
        )}

        {messages.map((m, i) => (
          <Message key={i} message={m} vault={vault} onOpenNote={onOpenNote} />
        ))}
      </div>

      {statusLabel && <div className={`ask-status ${status}`}>{statusLabel}</div>}

      <form
        className="ask-inputbar"
        onSubmit={(e) => {
          e.preventDefault()
          send(input)
        }}
      >
        {voiceSupported && (
          <button
            type="button"
            className={`icon-btn ${status === 'listening' && !voiceMode ? 'active' : ''}`}
            title="Speak one question"
            onClick={micOnce}
            disabled={status === 'thinking'}
          >
            🎙
          </button>
        )}
        {voiceSupported && (
          <button
            type="button"
            className={`icon-btn voice-mode ${voiceMode ? 'active' : ''}`}
            title="Voice mode: continuous conversation — it listens, answers out loud, and listens again"
            onClick={toggleVoiceMode}
          >
            {voiceMode ? '⏹ voice' : '∞ voice'}
          </button>
        )}
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={status === 'listening' ? 'listening…' : 'ask anything about pratham…'}
          disabled={status === 'listening'}
        />
        <button type="submit" className="icon-btn send" disabled={!input.trim() || status === 'thinking'}>
          ↑
        </button>
        <button
          type="button"
          className={`icon-btn ${showSettings ? 'active' : ''}`}
          title="Settings"
          onClick={() => setShowSettings((s) => !s)}
        >
          ⚙
        </button>
      </form>

      {showSettings && (
        <div className="ask-settings">
          <label>
            Claude API key
            <input
              type="password"
              value={apiKey}
              placeholder="sk-ant-…"
              onChange={(e) => {
                setApiKey(e.target.value)
                saveSetting('prat-brain.api-key', e.target.value)
              }}
            />
          </label>
          <label>
            Model
            <select
              value={model}
              onChange={(e) => {
                setModel(e.target.value)
                saveSetting('prat-brain.model', e.target.value)
              }}
            >
              {MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </label>
          <label className="row">
            <input
              type="checkbox"
              checked={speakReplies}
              onChange={(e) => {
                setSpeakReplies(e.target.checked)
                saveSetting('prat-brain.speak', e.target.checked ? '1' : '0')
              }}
            />
            read answers aloud
          </label>
          <p className="fineprint">
            The key is stored only in this browser's localStorage and sent directly to Anthropic —
            there is no backend. Without a key the brain answers in local extractive mode.
          </p>
        </div>
      )}
    </div>
  )
}

function Message({ message, vault, onOpenNote }) {
  const html = useMemo(
    () => (message.role === 'assistant' ? renderMarkdown(message.text, vault) : null),
    [message.text, message.role, vault],
  )

  function handleClick(e) {
    const link = e.target.closest('[data-note]')
    if (link) {
      e.preventDefault()
      onOpenNote(link.dataset.note)
    }
  }

  if (message.role === 'user') {
    return <div className="msg user">{message.text}</div>
  }
  return (
    <div className="msg assistant" onClick={handleClick}>
      {message.text ? (
        <div className="msg-body" dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <div className="msg-body typing">
          <span />
          <span />
          <span />
        </div>
      )}
      {message.sources?.length > 0 && (
        <div className="msg-sources">
          {message.sources.map((s) => (
            <button key={s.id} onClick={() => onOpenNote(s.id)} title={s.excerpt}>
              ✦ {s.title}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
