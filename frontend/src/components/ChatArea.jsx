import { useState, useRef, useEffect } from "react"

const TABS = [
  { key:"resume",      label:"Resume",      title:"Tailored Resume" },
  { key:"coverLetter", label:"Cover Letter", title:"Cover Letter" },
  { key:"email",       label:"Email",        title:"Application Email" },
]

export default function ChatArea({ messages, docs, generating, onRefine }) {
  const [input, setInput] = useState("")
  const [tab,   setTab]   = useState("resume")
  const endRef  = useRef(null)
  const taRef   = useRef(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior:"smooth" }) }, [messages, generating])

  const send = () => {
    const t = input.trim()
    if (!t || generating) return
    setInput("")
    if (taRef.current) taRef.current.style.height = "auto"
    onRefine(t)
  }

  const resize = e => {
    e.target.style.height = "auto"
    e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px"
  }

  return (
    <div className="chat-area">
      <div className="chat-top">
        <div className="chat-top-left">
          <div className="chat-top-title">Application Workspace</div>
          <div className="chat-top-sub">Fill your details on the left panel, then generate</div>
        </div>
        <div className="chat-top-badge">3 Documents</div>
      </div>

      <div className="messages">
        {messages.length === 0 && !generating && (
          <div className="welcome">
            <div className="welcome-icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            </div>
            <h2>Welcome to SanaDask</h2>
            <p>Your smart job application assistant. Fill in your profile and job details on the left, then click Generate My Documents to create a tailored resume, cover letter and email in seconds.</p>
            <div className="steps">
              <div className="step"><div className="step-num">1</div>Upload Resume</div>
              <div className="step"><div className="step-num">2</div>Add Job Details</div>
              <div className="step"><div className="step-num">3</div>Generate</div>
              <div className="step"><div className="step-num">4</div>Download</div>
            </div>
            <div className="welcome-chips">
              <span className="wchip">Tailored Resume</span>
              <span className="wchip">Cover Letter</span>
              <span className="wchip">Email Draft</span>
              <span className="wchip">DOCX + PDF</span>
            </div>
          </div>
        )}

        {messages.map(m => (
          <div key={m.id}>
            <div className={`msg ${m.role}`}>
              <div className={`msg-av ${m.role}`}>
                {m.role === "ai"
                  ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                  : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
              </div>
              <div className="msg-bub" dangerouslySetInnerHTML={{__html: fmt(m.content)}} />
            </div>
            {m.hasOutput && docs && <DocBlock docs={docs} tab={tab} setTab={setTab} />}
          </div>
        ))}

        {generating && (
          <div className="typing-row">
            <div className="msg-av ai">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            </div>
            <div className="typing-bub"><span/><span/><span/></div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="chat-input-row">
        <textarea ref={taRef} className="chat-input" rows={1}
          placeholder="Refine: Make cover letter shorter, Add my React skills, Change tone to formal..."
          value={input}
          onChange={e => { setInput(e.target.value); resize(e) }}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send() } }}
        />
        <button className="send-btn" onClick={send} disabled={generating || !input.trim()}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </div>
  )
}

function DocBlock({ docs, tab, setTab }) {
  const cur   = TABS.find(t => t.key === tab)
  const text  = docs?.[tab] || ""
  const files = docs?.files?.[tab]
  return (
    <div className="out-block">
      <div className="out-tabs">
        {TABS.map(t => (
          <button key={t.key} className={`out-tab ${tab === t.key ? "active" : ""}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="doc-card">
        <div className="doc-card-top">
          <div className="doc-card-title">{cur.title}</div>
          <div className="dl-row">
            {files?.docx
              ? <a className="dl-btn word" href={files.docx} download>Download Word</a>
              : <span className="dl-btn word" style={{opacity:.4,cursor:"not-allowed"}}>Download Word</span>}
            {files?.pdf
              ? <a className="dl-btn pdf" href={files.pdf} download>Download PDF</a>
              : <span className="dl-btn pdf" style={{opacity:.4,cursor:"not-allowed"}}>Download PDF</span>}
          </div>
        </div>
        <div className="doc-preview">{text || "No content yet."}</div>
      </div>
    </div>
  )
}

function fmt(t) {
  return t
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    .replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>")
    .replace(/\n/g,"<br/>")
}


