// Render structured demo data that must not appear as template source in static HTML.
const skills=[
  ['Program governance','Verified','strong'],['Stakeholder leadership','Verified','strong'],
  ['Transformation','Verified','strong'],['Risk management','Verified','strong'],
  ['Executive communication','Verified','strong'],['Agile delivery','Demonstrated',''],
  ['Financial understanding','Demonstrated',''],['AI literacy','Demonstrated',''],
  ['Cloud strategy','Demonstrated',''],['Benefits realization','Demonstrated',''],
  ['Cyber awareness','Demonstrated',''],['Vendor management','Developing','develop'],
  ['Change leadership','Developing','develop'],['Data literacy','Developing','develop'],
  ['Coaching','Developing','develop']
];
const skillContainer=document.querySelector('.skill-cloud>div:last-child');
if(skillContainer) skillContainer.innerHTML=skills.map(([name,state,style])=>`<button class="skill ${style}">${name}<small>${state}</small></button>`).join('');

const dimensions=[
  ['Leadership & governance',91,'greenbar'],['Program delivery',88,'greenbar'],
  ['Business transformation',82,'bluebar'],['Commercial ownership',70,'amberbar'],
  ['AI-enabled delivery',56,'amberbar'],['Evidence quality',63,'purplebar']
];
const dimensionContainer=document.querySelector('.dimension-bars');
if(dimensionContainer) dimensionContainer.innerHTML=dimensions.map(([name,score,color])=>`<div><span>${name}</span><i><em class="${color}" style="width:${score}%"></em></i><b>${score}%</b></div>`).join('');

const trends=[
  ['AI-assisted portfolio decisions','Emerging','+38%'],
  ['Responsible AI governance','Critical','+42%'],
  ['Digital operating models','Growing','+23%'],
  ['Traditional PMO reporting','Declining','−19%']
];
const marketPanel=[...document.querySelectorAll('#market .panel')].find(panel=>panel.querySelector('h2')?.textContent==='Skills changing around you');
if(marketPanel){
  marketPanel.querySelectorAll('.trend-row').forEach(row=>row.remove());
  marketPanel.insertAdjacentHTML('beforeend',trends.map(([skill,status,change])=>`<div class="trend-row"><span>${skill}</span><b>${status}</b><em>${change}</em></div>`).join(''));
  [...marketPanel.childNodes].filter(node=>node.nodeType===Node.TEXT_NODE&&['${','.map(','.join('].some(token=>node.textContent.includes(token))).forEach(node=>node.remove());
  marketPanel.querySelectorAll('[class*="${"], b, em, span').forEach(node=>{if(node.textContent.includes('${')||node.textContent.includes('.map(')||node.textContent.includes('.join('))node.remove()});
}
