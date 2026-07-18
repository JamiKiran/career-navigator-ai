import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors={
  'Access-Control-Allow-Origin':'*',
  'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type'
};

const modelPool={
  sol:Deno.env.get('OPENAI_MODEL_SOL')||'gpt-5.6-sol',
  terra:Deno.env.get('OPENAI_MODEL_TERRA')||'gpt-5.6-terra',
  luna:Deno.env.get('OPENAI_MODEL_LUNA')||'gpt-5.6-luna',
  gpt55:Deno.env.get('OPENAI_MODEL_GPT55')||'gpt-5.5',
  gpt55pro:Deno.env.get('OPENAI_MODEL_GPT55_PRO')||'gpt-5.5-pro',
  gpt54:Deno.env.get('OPENAI_MODEL_GPT54')||'gpt-5.4',
  gpt54pro:Deno.env.get('OPENAI_MODEL_GPT54_PRO')||'gpt-5.4-pro'
};

function routeModel(agentType:string,message:string){
  const complex=message.length>900||/compare|strategy|executive|transition|trade.?off|multi.?year/i.test(message);
  if(agentType==='counselor'||agentType==='copilot360'||agentType==='navigate'||agentType==='career'||agentType==='mentor'||complex)return{model:modelPool.sol,effort:'high'};
  if(agentType==='linkedin'||agentType==='understand'||agentType==='explore')return{model:modelPool.terra,effort:'medium'};
  if(agentType==='build'||agentType==='learning')return{model:modelPool.gpt55,effort:'medium'};
  if(agentType==='fairness'||agentType==='explainability')return{model:modelPool.gpt55pro,effort:'high'};
  if(agentType==='market'||agentType==='jobs')return{model:modelPool.gpt54pro,effort:'medium'};
  if(agentType==='skills'||agentType==='evidence'||agentType==='integrity')return{model:modelPool.gpt54,effort:'medium'};
  return{model:modelPool.luna,effort:'low'};
}

const prompts:Record<string,string>={
  counselor:'You are a private, empathetic Career Counseling Agent. Ground every observation in the individual approved CV, profile, achievements, constraints and aspirations. Never reuse sample-person details. Use reflective listening, ask at most one focused question when it materially improves the session, and provide specific options rather than directives. Separate facts, interpretations and uncertainty. Do not diagnose mental health, promise employment or make hiring decisions. When current market evidence is requested and consent permits, use web search and identify the sources used.',
  career:'Recommend realistic adjacent roles, compare trade-offs and give concrete next actions. Never promise employment.',
  skills:'Identify strengths, missing evidence, valuable emerging capabilities and declining skills. Explain every conclusion.',
  evidence:'Turn genuine work into credible STAR-style evidence. Never invent experience or achievements.',
  jobs:'Assess requirements against verified evidence, identify mandatory gaps and prepare an honest application strategy.',
  learning:'Build efficient learn-practise-prove-present plans within the user stated time and budget.',
  market:'Explain current career-demand signals and uncertainty. Never invent vacancies, salaries or statistics.',
  mentor:'Coordinate career, leadership, learning and wellbeing guidance into one sustainable plan.',
  privacy:'Explain exactly what approved data is used, identify unnecessary collection and provide user-control, export and deletion actions. Never claim deletion occurred without confirmation.',
  integrity:'Separate claims, demonstrated evidence, assessments and verified evidence. Flag unsupported statements and never invent qualifications or outcomes.',
  explainability:'Break recommendations and scores into evidence, reasoning, assumptions, uncertainty, limitations and improvement actions.',
  fairness:'Check for protected-trait inference, proxy bias, accessibility barriers and unjustified automated decisions. Require meaningful human review.',
  understand:'Build an evidence-led Career DNA from skills, experience, achievements, preferences and aspirations. Ask for missing information before scoring.',
  explore:'Identify realistic adjacent roles and hidden potential from transferable evidence. Explain fit, stretch, preparation and uncertainty.',
  navigate:'Compare routes by time, cost, transition risk, expected value, constraints and reversibility. Show assumptions and trade-offs.',
  build:'Create adaptive learn-practise-prove-present plans with priorities, time estimates, evidence outcomes and checkpoints.',
  copilot360:'Act as the coordinating 360 degree Career Copilot. Synthesize Career DNA, opportunities, route trade-offs, reskilling, evidence, job fit, market intelligence, privacy, explainability and fairness. Delegate conceptually to the relevant specialists, identify conflicts, select the best next action and name the exact platform capability the user should open next.',
  linkedin:'You are Oikodomos, the LinkedIn Career Architect. Treat the LinkedIn content supplied in the current request as the primary source for this analysis; use the saved Career Profile only as secondary context and explicitly flag conflicts. Never reuse sample-person assumptions. Analyze only information voluntarily supplied by the user. Do not request credentials, bypass access controls or claim to have read a URL that was unavailable. Extract the individual\'s evidenced skills, achievements, domain, seniority signals and measurable outcomes; distinguish facts from inference; research current demand when web access is permitted; identify tailored future skills; and recommend three realistic pathways with specific actions.'
};

Deno.serve(async req=>{
  if(req.method==='OPTIONS')return new Response('ok',{headers:cors});
  try{
    const token=req.headers.get('Authorization');
    if(!token)throw new Error('Authentication required');
    const supabase=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_ANON_KEY')!,{global:{headers:{Authorization:token}}});
    const {data:{user},error:userError}=await supabase.auth.getUser();
    if(userError||!user)throw new Error('Invalid session');
    const body=await req.json();
    const agentType=String(body.agent_type||'');
    const message=String(body.message||'').trim();
    if(!prompts[agentType]||message.length<2||message.length>6000)throw new Error('Invalid agent request');

    const [{data:profile},{data:goals},{data:evidence}]=await Promise.all([
      supabase.from('profiles').select('full_name,current_role,target_role,location,readiness,profile_data').eq('id',user.id).maybeSingle(),
      supabase.from('career_goals').select('title,status,target_date,preferences').eq('user_id',user.id).eq('status','active').limit(5),
      supabase.from('evidence').select('title,evidence_type,skills,verification_status').eq('user_id',user.id).limit(20)
    ]);
    const approvedContext={profile:profile||body.context||{},goals:goals||[],evidence:evidence||[],current_session:body.context||{}};
    const route=routeModel(agentType,message);
    const {data:run,error:insertError}=await supabase.from('agent_runs').insert({user_id:user.id,agent_type:agentType,input:message,context:approvedContext,status:'running',model:route.model}).select('id').single();
    if(insertError)throw insertError;

    const webEnabled=body.context?.consent?.web_research===true;
    const requestBody:any={
      model:route.model,
      reasoning:{effort:route.effort},
      input:[
        {role:'system',content:`${prompts[agentType]} Act only on user-approved profile data. Distinguish stored evidence, user claims, inference and live research. Never fabricate experience, jobs, salaries, qualifications or statistics. Provide: Assessment, Profile evidence used, Reasoning, Next 3 actions, Risks, uncertainty and human-review point.`},
        {role:'user',content:`Approved private career context:\n${JSON.stringify(approvedContext)}\n\nUser request:\n${message}`}
      ],
      max_output_tokens:1800
    };
    if(webEnabled)requestBody.tools=[{type:'web_search'}];
    const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${Deno.env.get('OPENAI_API_KEY')}`,'Content-Type':'application/json'},body:JSON.stringify(requestBody)});
    if(!response.ok)throw new Error(`AI service returned ${response.status}`);
    const result=await response.json();
    const answer=result.output_text||result.output?.flatMap((item:any)=>item.content||[]).filter((x:any)=>x.type==='output_text').map((x:any)=>x.text).join('\n')||'No answer returned.';
    await supabase.from('agent_runs').update({answer,status:'completed',summary:answer.slice(0,240),completed_at:new Date().toISOString()}).eq('id',run.id);
    return new Response(JSON.stringify({run_id:run.id,answer,model:route.model,web_research:webEnabled}),{headers:{...cors,'Content-Type':'application/json'}});
  }catch(error){
    return new Response(JSON.stringify({error:error.message||'Agent failed'}),{status:400,headers:{...cors,'Content-Type':'application/json'}});
  }
});
