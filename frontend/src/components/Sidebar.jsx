import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import toast from "react-hot-toast"
import { uploadResume } from "../utils/api.js"

export default function Sidebar({ resumeFile,setResumeFile,setResumeText,githubUrl,setGithubUrl,scholarUrl,setScholarUrl,companyName,setCompanyName,companyNotes,setCompanyNotes,jobDesc,setJobDesc,onGenerate,generating,progress,progressLabel }) {
  const onDrop = useCallback(async (accepted) => {
    const file = accepted[0]
    if (!file) return
    setResumeFile(file)
    try {
      const r = await uploadResume(file)
      setResumeText(r.text)
      toast.success("Resume uploaded: " + file.name)
    } catch {
      const t = await file.text()
      setResumeText(t.slice(0, 8000))
      toast.success("Resume loaded: " + file.name)
    }
  }, [setResumeFile, setResumeText])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [], "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [], "text/plain": [] },
    maxFiles: 1
  })

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="sidebar-greeting">Welcome to SanaDask</div>
        <div className="sidebar-title">Smart Application Builder</div>
      </div>

      <div className="sidebar-body">
        <div>
          <div className="section-title">Your Profile</div>

          <div className={`icard ${resumeFile ? "filled" : ""}`}>
            <div className="icard-header">
              <div className="icard-icon ic-indigo">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              </div>
              <div><div className="icard-label">Resume</div><div className="icard-sub">PDF, DOCX or TXT</div></div>
              <div className="icard-check">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
            </div>
            <div {...getRootProps()} className={`dropzone ${isDragActive ? "drag" : ""}`}>
              <input {...getInputProps()} />
              <div className="dz-title">{isDragActive ? "Drop here" : "Click or drag to upload"}</div>
              <div className="dz-sub">PDF, DOCX, TXT supported</div>
              {resumeFile && <div className="dz-file">+ {resumeFile.name}</div>}
            </div>
          </div>

          <div className={`icard ${githubUrl ? "filled" : ""}`} style={{marginTop:8}}>
            <div className="icard-header">
              <div className="icard-icon ic-blue">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
              </div>
              <div><div className="icard-label">GitHub</div><div className="icard-sub">Portfolio URL</div></div>
              <div className="icard-check">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
            </div>
            <input className="field" type="url" placeholder="https://github.com/username" value={githubUrl} onChange={e=>setGithubUrl(e.target.value)} />
          </div>

          <div className={`icard ${scholarUrl ? "filled" : ""}`} style={{marginTop:8}}>
            <div className="icard-header">
              <div className="icard-icon ic-amber">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
              </div>
              <div><div className="icard-label">Google Scholar</div><div className="icard-sub">Publications URL</div></div>
              <div className="icard-check">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
            </div>
            <input className="field" type="url" placeholder="https://scholar.google.com/citations?user=..." value={scholarUrl} onChange={e=>setScholarUrl(e.target.value)} />
          </div>
        </div>

        <div style={{marginTop:6}}>
          <div className="section-title">Job Details</div>

          <div className={`icard ${companyName ? "filled" : ""}`}>
            <div className="icard-header">
              <div className="icard-icon ic-green">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              </div>
              <div><div className="icard-label">Company</div><div className="icard-sub">Name and notes</div></div>
              <div className="icard-check">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
            </div>
            <input className="field" placeholder="e.g. Google, Meta, Amazon" value={companyName} onChange={e=>setCompanyName(e.target.value)} />
            <input className="field" placeholder="Culture notes (optional)" value={companyNotes} onChange={e=>setCompanyNotes(e.target.value)} />
          </div>

          <div className={`icard ${jobDesc ? "filled" : ""}`} style={{marginTop:8}}>
            <div className="icard-header">
              <div className="icard-icon ic-rose">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              </div>
              <div><div className="icard-label">Job Description</div><div className="icard-sub">Paste full JD here</div></div>
              <div className="icard-check">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
            </div>
            <textarea className="field" style={{minHeight:90}} placeholder="Paste the complete job description including role, requirements and responsibilities..." value={jobDesc} onChange={e=>setJobDesc(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="sidebar-footer">
        {progressLabel && (
          <div className="prog-wrap">
            <div className="prog-label">{progressLabel}</div>
            <div className="prog-track"><div className="prog-fill" style={{width:progress+"%"}} /></div>
          </div>
        )}
        <button className="gen-btn" onClick={onGenerate} disabled={generating}>
          {generating
            ? <><Spin /> Generating documents...</>
            : <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                Generate My Documents
              </>}
        </button>
      </div>
    </aside>
  )
}

function Spin() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{animation:"spin 1s linear infinite"}} xmlns="http://www.w3.org/2000/svg">
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
    </svg>
  )
}



