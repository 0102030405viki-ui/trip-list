import { useState } from "react";
import { FileText, Save, Sparkles } from "lucide-react";
import { motion } from "motion/react";

function TravelJournal({notes,onSave}) {
  const [value,setValue]=useState(notes); const [summary,setSummary]=useState(""); const [loading,setLoading]=useState(false);
  async function summarize(){if(!value.trim()||loading)return;setLoading(true);setSummary("");try{const r=await fetch("/api/ai/summarize",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({notes:value})});const d=await r.json();if(!r.ok)throw new Error();setSummary(d.text);}catch{setSummary("I couldn't summarise your notes right now. Make sure the AI server is running.");}finally{setLoading(false);}}
  return <motion.div className="journal" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}><div className="journal-heading"><div><p className="eyebrow">YOUR MEMORY</p><h3>Travel journal</h3></div><FileText size={20}/></div><textarea value={value} onChange={e=>setValue(e.target.value)} placeholder="Write about what you saw, ate, loved, or would do differently..."/><div className="journal-actions"><button className="secondary-button" onClick={()=>onSave(value)}><Save size={15}/> Save notes</button><button className="ai-button" onClick={summarize} disabled={loading||!value.trim()}><Sparkles size={15}/> {loading?"Summarising...":"Summarise with AI"}</button></div>{summary&&<div className="summary-card"><p className="eyebrow">AI SUMMARY</p><p>{summary}</p></div>}</motion.div>;
}
export default TravelJournal;
