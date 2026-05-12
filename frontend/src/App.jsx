import { useState, useRef } from "react"
import toast from "react-hot-toast"
import Header from "./components/Header.jsx"
import Sidebar from "./components/Sidebar.jsx"
import ChatArea from "./components/ChatArea.jsx"
import { generateDocuments, refineDocuments } from "./utils/api.js"
import "./styles/app.css"

export default function App() {
  const [resumeText,   setResumeText]   = useState("")
  const [resumeFile,   setResumeFile]   = useState(null)
  const [githubUrl,    setGithubUrl]    = useState("")
  const [scholarUrl,   setScholarUrl]   = useState("")
  const [companyName,  setCompanyName]  = useState("")
  const [companyNotes, setCompanyNotes] = useState("")
  const [jobDesc,      setJobDesc]      = useState("")
  const [docs,         setDocs]         = useState(null)
  const [messages,     setMessages]     = useState([])
  const [conversation, setConversation] = useState([])
  const [generating,   setGenerating]   = useState(false)
  const [progress,     setProgress]     = useState(0)
  const [progLabel,    setProgLabel]    = useState("")
  const progRef = useRef(null)

  const startProg = () => {
    const steps = [[10,"Analysing job requirements..."],[28,"Matching your profile..."],[50,"Writing tailored resume..."],[68,"Crafting cover letter..."],[84,"Composing email..."],[95,"Finalising..."]]
    let i=0
    progRef.current = setInterval(()=>{ if(i<steps.length){setProgress(steps[i][0]);setProgLabel(steps[i][1]);i++} },900)
  }
  const stopProg = () => { clearInterval(progRef.current);setProgress(100);setTimeout(()=>{setProgress(0);setProgLabel("")},600) }
  const addMsg = (role,content,meta={}) => setMessages(p=>[...p,{id:Date.now()+Math.random(),role,content,...meta}])

  const handleGenerate = async () => {
    if (!jobDesc.trim())     return toast.error("Please paste a job description")
    if (!companyName.trim()) return toast.error("Please enter the company name")
    setGenerating(true); startProg()
    addMsg("user", `Generating documents for **${companyName}**`)
    try {
      const r = await generateDocuments({company_name:companyName,job_description:jobDesc,github_url:githubUrl,scholar_url:scholarUrl,company_notes:companyNotes,resume_text:resumeText})
      setDocs(r); setConversation(r.conversation||[])
      addMsg("ai", r.summary||"Your documents are ready. Click the tabs below to preview each one.", {hasOutput:true,files:r.files})
      toast.success("Documents generated!")
    } catch(e) {
      const m = e.response?.data?.detail||e.message||"Something went wrong"
      addMsg("ai",`Error: ${m}`)
      toast.error(m)
    } finally { stopProg(); setGenerating(false) }
  }

  const handleRefine = async (msg) => {
    if (!docs) return toast.error("Generate documents first")
    setGenerating(true); addMsg("user",msg)
    try {
      const r = await refineDocuments({message:msg,current_resume:docs.resume||"",current_cover_letter:docs.coverLetter||"",current_email:docs.email||"",company_name:companyName,job_description:jobDesc,conversation_history:conversation})
      if (r.type==="update") {
        const u={...docs,resume:r.resume,coverLetter:r.coverLetter,email:r.email}
        if(r.files) u.files={...docs.files,...r.files}
        setDocs(u)
        addMsg("ai",r.summary||"Documents updated.",{hasOutput:true,files:u.files})
        toast.success("Updated!")
      } else { addMsg("ai",r.message) }
      setConversation(p=>[...p,{role:"user",content:msg},{role:"assistant",content:r.message||r.summary||""}])
    } catch(e) {
      addMsg("ai","Sorry, something went wrong.")
      toast.error(e.message)
    } finally { setGenerating(false) }
  }

  return (
    <div className="app-shell">
      <Header />
      <div className="app-body">
        <Sidebar
          resumeFile={resumeFile}     setResumeFile={setResumeFile}
          setResumeText={setResumeText}
          githubUrl={githubUrl}       setGithubUrl={setGithubUrl}
          scholarUrl={scholarUrl}     setScholarUrl={setScholarUrl}
          companyName={companyName}   setCompanyName={setCompanyName}
          companyNotes={companyNotes} setCompanyNotes={setCompanyNotes}
          jobDesc={jobDesc}           setJobDesc={setJobDesc}
          onGenerate={handleGenerate}
          generating={generating}
          progress={progress}
          progressLabel={progLabel}
        />
        <ChatArea messages={messages} docs={docs} generating={generating} onRefine={handleRefine} />
      </div>
    </div>
  )
}

