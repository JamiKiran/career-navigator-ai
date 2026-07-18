const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}});
const clean=value=>String(value??'').replace(/[\u0000-\u001f]/g,' ').trim();
const AGENTS={
  counselor:'Provide empathetic, practical career counseling grounded only in the supplied CV, goals, evidence and constraints.',
  career:'Compare realistic career paths, trade-offs and next actions.',
  skills:'Identify demonstrated, missing, transferable and emerging skills.',
  evidence:'Audit claims and turn genuine achievements into verifiable evidence without invention.',
  jobs:'Assess a supplied role and prepare an honest application strategy.',
  learning:'Create a value-driven reskilling plan with practice and proof.',
  market:'Research current role, skill and market signals and clearly cite sources.',
  mentor:'Coordinate a sustainable personal action plan.',
  counselor_score:'Act as the Career Copilot Scoring Agent. Produce an explainable professional-development score from 0-100, dimension scores, evidence confidence, missing evidence, uncertainty and three improvement actions. Never treat the score as employability or eligibility.',
  copilot360:'Coordinate the specialist agents into one evidence-grounded plan.',
  linkedin:'Analyze only user-provided LinkedIn text and recommend an honest, future-ready profile.',
  privacy:'Explain personal-data use, minimization, access, export and deletion controls.',
  integrity:'Audit unsupported or unverifiable claims.',
  explainability:'Explain evidence, assumptions, uncertainty and limitations.',
  fairness:'Check for proxy discrimination and protected-trait inference.'
};
function systemPrompt(type){return [
  'You are a Career Navigator AI specialist. '+(AGENTS[type]||AGENTS.counselor),
  'Personalize only from user-approved context. Never invent CV facts, qualifications, jobs, salary data or evidence.',
  'Distinguish facts, inferences, web findings and uncertainty.',
  'Do not infer protected characteristics or rank a person\'s worth.',
  'This is career-development guidance, never an employment, credit, insurance, clinical or legal decision.',
  'Use current web search when it materially improves the answer and cite sources in the response.',
  'Give concrete, value-driven actions and allow human correction.',
  'Do not expose hidden reasoning; provide a concise rationale and evidence summary.',
  'Apply data minimization and ignore irrelevant sensitive data if supplied.'
].join('\n')}
async function agent(request,env){
  if(!env.OPENAI_API_KEY)return json({error:'OPENAI_API_KEY is not configured in Cloudflare secrets.'},503);
  let body;try{body=await request.json()}catch{return json({error:'Invalid JSON request.'},400)}
  const type=clean(body.agent_type).slice(0,40),message=clean(body.message).slice(0,6000),context=body.context&&typeof body.context==='object'?body.context:{};
  if(!message)return json({error:'A request is required.'},400);
  const safeContext=JSON.stringify(context).slice(0,24000),webApproved=context?.privacy?.web_research_approved===true;
  const payload={model:env.OPENAI_MODEL||'gpt-5.6-terra',instructions:systemPrompt(type),input:'USER REQUEST:\n'+message+'\n\nUSER-APPROVED CAREER CONTEXT:\n'+safeContext,store:false,max_output_tokens:2200};
  if(webApproved){payload.tools=[{type:'web_search'}];payload.tool_choice='auto'}
  const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{authorization:'Bearer '+env.OPENAI_API_KEY,'content-type':'application/json'},body:JSON.stringify(payload)});
  const data=await response.json();if(!response.ok)return json({error:data?.error?.message||'OpenAI request failed.'},response.status);
  const answer=data.output_text||data.output?.flatMap(item=>item.content||[]).map(part=>part.text||'').join('\n').trim();
  return json({answer:answer||'No response was produced.',agent_type:type,model:env.OPENAI_MODEL||'gpt-5.6-terra',web_research:webApproved,stored:false});
}
export default{async fetch(request,env){const url=new URL(request.url);if(url.pathname==='/api/agent'&&request.method==='POST')return agent(request,env);if(url.pathname==='/api/health')return json({ok:true,openai_configured:Boolean(env.OPENAI_API_KEY)});if(url.pathname.startsWith('/api/'))return json({error:'Not found'},404);return env.ASSETS.fetch(request)}};
