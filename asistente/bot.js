// bot.js — Catálogo unificado + botones de acceso rápido + flujo de cotización + CTA actualizado + voz continua

/***** DOM *****/
const msgs  = document.getElementById('messages');
const input = document.getElementById('input');
const send  = document.getElementById('send');
const typing= document.getElementById('typing');
const clear = document.getElementById('clear');
const micBtn= document.getElementById('mic');

/***** Storage *****/
const STORAGE_KEY = 'cdd_chat_history_v1';
const QUOTE_KEY   = 'cdd_quote_leads_v1';
const FLOW_KEY    = 'cdd_quote_flow_state_v1';

/***** Contactos *****/
// Tel oficial para recibir leads (se mantiene)
const OFICIAL_PHONE = "573202608864";
// Tel del CTA (nuevo pedido)
const CTA_PHONE     = "573202608864";
const OFICIAL_MAIL  = "centrodigitaldediseno@gmail.com";

/***** Estado flujo *****/
let flow = loadFlowState() || { activo:false, paso:0, datos:{nombre:"",servicios:"",empresa:"",telefono:""} };

/***** Util *****/
const CTA = `\n\n**¿Quieres cotizar tu proyecto?** Escribe **cotizar** o contáctanos: **+${CTA_PHONE}** · **${OFICIAL_MAIL}**`;
const BTN = "display:inline-block;margin:6px 8px 0 0;background:#10a37f;color:#fff;text-decoration:none;padding:10px 14px;border-radius:12px;font-weight:700;font-size:14px";

/***** Catálogo unificado con BOTONES *****/
const KB = {
  overview:
`### Servicios (catálogo)
Elige una categoría:

<a href="#" class="inline-cta" data-q="Páginas web" style="${BTN}">🖥️ Páginas web</a>
<a href="#" class="inline-cta" data-q="Branding" style="${BTN}">🎨 Branding</a>
<a href="#" class="inline-cta" data-q="Contenido para redes" style="${BTN}">📱 Contenido</a>
<a href="#" class="inline-cta" data-q="Social Media Manager" style="${BTN}">👥 Social</a>
<a href="#" class="inline-cta" data-q="SEO" style="${BTN}">🔎 SEO</a>
<a href="#" class="inline-cta" data-q="Campañas Ads" style="${BTN}">💡 Ads</a>
<a href="#" class="inline-cta" data-q="Estrategias de marketing" style="${BTN}">📈 Marketing</a>
<a href="#" class="inline-cta" data-q="Automatizaciones con IA" style="${BTN}">⚙️ Automatizaciones IA</a>
<a href="#" class="inline-cta" data-q="Bots y Asistentes IA" style="${BTN}">🤖 Bots & Asistentes</a>
<a href="#" class="inline-cta" data-q="Contenido con IA" style="${BTN}">🎬 Contenido con IA</a>
<a href="#" class="inline-cta" data-q="Embudos y Realidad Aumentada" style="${BTN}">🧭 Embudos & RA</a>
<a href="#" class="inline-cta" data-q="Apps Premium" style="${BTN}">🟣 Apps Premium</a>
<a href="#" class="inline-cta" data-q="Marketing con IA" style="${BTN}">🧠 Marketing con IA</a>
<a href="https://gold-snail-248674.hostingersite.com/chatbot.html" target="_blank" style="${BTN}">🚀 Crear agente gratis</a>
<a href="#" class="inline-cta" data-q="Cotizar" style="${BTN}">💬 Cotizar ahora</a>
${CTA}`,

  // (resto de descripciones – sin cambios funcionales)
  web:
`### Páginas web (moderno + conversión)
- Landing, multipágina y e-commerce.
- Performance, SEO técnico y analítica.
- Integración con WhatsApp/CRM/automatizaciones.${CTA}`,
  branding:
`### Branding & Marca
- Logo, sistema visual y manual de marca.
- Refresh y lineamientos aplicados.${CTA}`,
  fotografia:
`### Fotografía de producto
- Foto y micro-video para catálogo/ads.
- Retoque y entregables por plataforma.${CTA}`,
  contenido:
`### Contenido para redes
- Reels/TikTok/Shorts, carruseles, estáticos.
- Guión, edición/motion y calendario editorial.${CTA}`,
  social:
`### Social Media Manager
- Gestión de redes, moderación y reporting.
- Optimización por cohortes; integración con paid.${CTA}`,
  seo:
`### SEO (web + social)
- Auditoría técnica y on-page.
- Estrategia de contenidos y descubrimiento.${CTA}`,
  ads:
`### Campañas Ads (Meta, Google, TikTok)
- Creativo + segmentación, píxeles/CAPI.
- Tests A/B y escalado por ROAS.${CTA}`,
  marketing:
`### Estrategias de marketing & funnels
- Embudos full-funnel; email/SMS/WA nurturing.
- Dashboards de KPIs de adquisición y LTV.${CTA}`,
  auto_ia:
`### Automatizaciones con IA
- Procesos y atención al cliente 24/7.
- CRM, formularios, email/WA, Make/Zapier.${CTA}`,
  bots_ia:
`### Bots & Asistentes (mensajes y llamadas)
- WhatsApp/IG/Messenger y asistentes por voz.
- Calificación de leads + handoff a humano.${CTA}`,
  contenido_ia:
`### Contenido con IA (video e imagen)
- Videos conceptuales/publicitarios/explicativos.
- Generación de imágenes para campañas.${CTA}`,
  embudos_ra:
`### Embudos automatizados & Realidad Aumentada
- Captura → calificación → conversión con IA.
- Experiencias AR y medición.${CTA}`,
  apps_premium:
`### Apps Premium
- Licencias (VPN, YouTube Premium, PhotoRoom…).
- Onboarding y soporte a equipos.${CTA}`,
  mkt_ia:
`### Marketing con IA
- Análisis predictivo; personalización de campañas.
- Testing continuo con modelos y datos propios.${CTA}`,
  agente:
`### Crea tu **agente gratis**
Lanza un prototipo y pruébalo en tu web/WA.

<a href="https://gold-snail-248674.hostingersite.com/chatbot.html" target="_blank" style="${BTN}">🚀 Crear agente gratis</a>`,
  cotiz:
`### Precios & cotización
Trabajamos **por alcance y objetivos** (web/branding/IA/ads).
1) Brief + llamada (15–20 min)
2) Propuesta con entregables/tiempos/valor
3) Arranque del Sprint 1
${CTA}`
};

/***** Arranque *****/
restoreHistory();
if (historyEmpty()) {
  botMsg("👋 **Hola!** Este es nuestro **catálogo unificado**. Usa los botones o di *“Cotizar”*.");
  botMsg(KB.overview);
}

/***** Listeners *****/
send?.addEventListener('click', () => {
  const txt = input.value.trim(); if (!txt) return;
  input.value=""; userMsg(txt); route(txt);
});
input?.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send?.click(); }
});
document.querySelectorAll('.chip').forEach(c=>{
  c.addEventListener('click', ()=>{ userMsg(c.dataset.q); route(c.dataset.q); });
});
clear?.addEventListener('click', ()=>{
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(FLOW_KEY);
  msgs.innerHTML=""; typing.style.display="none";
  flow = { activo:false, paso:0, datos:{nombre:"",servicios:"",empresa:"",telefono:""} };
  botMsg("🧹 Historial limpio. ¿Escribes **cotizar** o vemos servicios?");
});

// Delegación para botones inline dentro del chat
msgs?.addEventListener('click', e=>{
  const el = e.target.closest('[data-q].inline-cta'); 
  if (el){ e.preventDefault(); const q = el.getAttribute('data-q')||''; if(q){ userMsg(q); route(q);} }
});

/***** Voz continua *****/
let rec=null, micActive=false;
(function setupVoice(){
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR || !micBtn) return;
  rec = new SR(); rec.lang = 'es-ES'; rec.interimResults = true; rec.continuous = true;

  rec.onresult = (ev)=>{
    let finalText = '';
    for (let i=ev.resultIndex; i<ev.results.length; i++){
      const res = ev.results[i];
      if (res.isFinal){ finalText += res[0].transcript.trim() + ' '; }
    }
    if (finalText){
      input.value = '';
      userMsg(finalText.trim());
      route(finalText.trim());
    }
  };
  rec.onend = ()=>{ if (micActive) try{ rec.start(); }catch(_){} };

  micBtn.addEventListener('click', ()=>{
    if (!micActive){
      try{ rec.start(); micActive=true; micBtn.classList.add('active'); micBtn.textContent='🎤 Escuchando'; }catch(_){}
    }else{
      rec.stop(); micActive=false; micBtn.classList.remove('active'); micBtn.textContent='🎤 Hablar';
    }
  });
})();

/***** Router *****/
function route(q){
  if (/^cancelar$/i.test(q.trim())){ if (flow.activo){ flow={activo:false,paso:0,datos:{nombre:"",servicios:"",empresa:"",telefono:""}}; saveFlowState(); return botMsg("Flujo cancelado. Escribe **cotizar** para retomarlo."); } }
  if (flow.activo){ handleCotizacion(q); return; }

  const qn = norm(q);

  if (/^servicios$|cat[aá]logo|categor[ií]as|todo$/.test(qn)) return botMsg(KB.overview);

  if (/p[aá]gina|web|ecommerce|tienda|landing/.test(qn)) return botMsg(KB.web);
  if (/branding|marca|logo|manual/.test(qn)) return botMsg(KB.branding);
  if (/foto|fotograf/.test(qn)) return botMsg(KB.fotografia);
  if (/contenido.*red|reels|tiktok|shorts|posts?/.test(qn)) return botMsg(KB.contenido);
  if (/social.*manager|smm|gesti[oó]n.*red/.test(qn)) return botMsg(KB.social);
  if (/\bseo\b|posicionamiento/.test(qn)) return botMsg(KB.seo);
  if (/ads|camp[aá]ñas|anuncios|google|meta|tiktok/.test(qn)) return botMsg(KB.ads);
  if (/estrategias? de marketing|funnel|embudo|growth/.test(qn)) return botMsg(KB.marketing);
  if (/automatizaciones?.*ia/.test(qn)) return botMsg(KB.auto_ia);
  if (/bots?.*ia|asistentes?.*ia|llamadas?.*ia/.test(qn)) return botMsg(KB.bots_ia);
  if (/contenido.*ia|video.*ia|imagen.*ia|audiovisual.*ia/.test(qn)) return botMsg(KB.contenido_ia);
  if (/embudos?.*automatizados|realidad aumentada|ra\b/.test(qn)) return botMsg(KB.embudos_ra);
  if (/apps?.*premium|vpn|youtube premium|photoroom/.test(qn)) return botMsg(KB.apps_premium);
  if (/marketing.*ia|predictivo|personalizaci[oó]n/.test(qn)) return botMsg(KB.mkt_ia);

  if (/cotiz|presupuesto|precio|cu[aá]nto vale|cu[aá]nto cuesta/.test(qn)) { startCotizacion(); return; }
  if (/agente gratis|crear.*agente|chatbot gratis/.test(qn)) return botMsg(KB.agente);

  const hit = smallSearch(qn); if (hit) return botMsg(hit);
  botMsg("Puedo ayudarte con cualquier categoría del **catálogo** o iniciar **cotización**. " + CTA);
}

/***** Flujo de Cotización *****/
function startCotizacion(){
  flow = { activo:true, paso:1, datos:{nombre:"", servicios:"", empresa:"", telefono:""} };
  saveFlowState();
  botMsg("¡Perfecto! Para cotizar necesito unos datos.\n\n1️⃣ ¿Cuál es tu **nombre completo**?\n\n*(Escribe `cancelar` para salir.)*");
}
function handleCotizacion(respuesta){
  const text = respuesta.trim();
  switch(flow.paso){
    case 1:
      flow.datos.nombre=text; flow.paso=2; saveFlowState();
      botMsg(`Gracias, **${escapeHTML(text)}**.\n2️⃣ ¿Qué **servicios** te interesan? _Ej.: “Landing + branding + automatización WhatsApp”_`);
      break;
    case 2:
      flow.datos.servicios=text; flow.paso=3; saveFlowState();
      botMsg("3️⃣ ¿Cómo se llama tu **empresa o proyecto**?");
      break;
    case 3:
      flow.datos.empresa=text; flow.paso=4; saveFlowState();
      botMsg("4️⃣ ¿Cuál es tu **número de WhatsApp o teléfono**?");
      break;
    case 4:
      if (!isValidPhone(text)) return botMsg("Formato no válido. Ej.: `3001234567` o `+57 3001234567`.");
      flow.datos.telefono=cleanPhone(text); finalizeQuote(); break;
    default:
      flow={activo:false,paso:0,datos:{nombre:"",servicios:"",empresa:"",telefono:""}}; saveFlowState();
      botMsg("He reiniciado el flujo. Escribe **cotizar** para empezar.");
  }
}
function finalizeQuote(){
  const leads = JSON.parse(localStorage.getItem(QUOTE_KEY)||"[]");
  leads.push({ ...flow.datos, fecha:new Date().toISOString() });
  localStorage.setItem(QUOTE_KEY, JSON.stringify(leads));

  const { nombre, servicios, empresa, telefono } = flow.datos;
  const wappText = encodeURIComponent(`Hola, soy ${nombre} (${empresa}). Me interesa: ${servicios}. Mi contacto: ${telefono}.`);
  const mailBody = encodeURIComponent(`Nombre: ${nombre}
Servicios: ${servicios}
Empresa/Proyecto: ${empresa}
Teléfono: ${telefono}

Mensaje: Hola, quiero avanzar con la cotización.`);

  const btn = "display:inline-block;margin-top:8px;margin-right:8px;background:#10a37f;color:#fff;text-decoration:none;padding:8px 14px;border-radius:10px;font-weight:600;font-size:14px";

  const resumen =
`### ¡Genial, ${escapeHTML(nombre)}! 🙌
**Resumen**
- **Servicios:** ${escapeHTML(servicios)}
- **Empresa/Proyecto:** ${escapeHTML(empresa)}
- **WhatsApp/Teléfono:** ${escapeHTML(telefono)}

**Acceso rápido**  
<a href="https://wa.me/${OFICIAL_PHONE}?text=${wappText}" target="_blank" style="${btn}">📲 WhatsApp Oficial</a>
<a href="mailto:${OFICIAL_MAIL}?subject=Cotización&body=${mailBody}" style="${btn}">✉️ Email Oficial</a>

> Si necesitas corregir algo, escribe **cotizar** para iniciar nuevamente.`;

  flow={activo:false,paso:0,datos:{nombre:"",servicios:"",empresa:"",telefono:""}}; saveFlowState();
  botMsg(resumen); botMsg(KB.cotiz);
}

/***** Buscador difuso *****/
function smallSearch(q){
  const pairs = [
    [KB.web,["web","ecommerce","tienda","landing","sitio"]],
    [KB.branding,["branding","marca","logo","manual"]],
    [KB.fotografia,["foto","fotografia","fotografía","producto"]],
    [KB.contenido,["contenido","reels","tiktok","shorts","post"]],
    [KB.social,["social media","smm","gestion redes","gestión redes","community"]],
    [KB.seo,["seo","posicionamiento"]],
    [KB.ads,["ads","campañas","anuncios","google","meta","tiktok"]],
    [KB.marketing,["marketing","funnel","embudo","growth","estrategia"]],
    [KB.auto_ia,["automatizacion ia","automatización ia"]],
    [KB.bots_ia,["bots ia","asistentes ia","llamadas ia"]],
    [KB.contenido_ia,["contenido ia","video ia","imagen ia"]],
    [KB.embudos_ra,["embudos automatizados","realidad aumentada","ra"]],
    [KB.apps_premium,["apps premium","vpn","youtube premium","photoroom"]],
    [KB.mkt_ia,["marketing ia","predictivo","personalizacion","personalización"]],
    [KB.agente,["agente gratis","crear agente","chatbot gratis"]],
    [KB.overview,["servicios","catalogo","catálogo","categorias","categorías","todo"]],
    [KB.cotiz,["cotiz","presupuesto","precio","cuanto vale","cuánto vale","cuanto cuesta","cuánto cuesta"]],
  ];
  let best=null,score=0;
  pairs.forEach(([text,keys])=>{
    const s = keys.reduce((acc,k)=> acc + (q.includes(k)?1:0), 0);
    if (s>score){score=s; best=text;}
  });
  return score>0 ? best : null;
}

/***** Render *****/
function render(role, mdText){
  const row = document.createElement("div");
  row.className = "row " + (role === "assistant" ? "assistant" : "user");

  const av = document.createElement("div");
  av.className = "avatar";
  av.textContent = role === "assistant" ? "AI" : "Tú";

  const bub = document.createElement("div");
  bub.className = "bubble";

  let html = mdToHTML(mdText)
    .replace(/WhatsApp:\s*(https?:\/\/[^\s<]+)/gi, (_m, url) => {
      const b = "display:inline-block;margin-top:8px;margin-right:8px;background:#10a37f;color:#fff;text-decoration:none;padding:8px 14px;border-radius:10px;font-weight:600;font-size:14px";
      return `<a href="${url}" target="_blank" style="${b}">📲 WhatsApp</a>`;
    })
    .replace(/Email:\s*(mailto:[^\s<]+)/gi, (_m, url) => {
      const b = "display:inline-block;margin-top:8px;margin-right:8px;background:#10a37f;color:#fff;text-decoration:none;padding:8px 14px;border-radius:10px;font-weight:600;font-size:14px";
      return `<a href="${url}" style="${b}">✉️ Email</a>`;
    });

  bub.innerHTML = html;

  // Botón Copiar
  bub.querySelectorAll("pre").forEach(pre=>{
    const head=document.createElement("div"); head.className="code-head"; head.innerHTML=`<span>código</span>`;
    const btn=document.createElement("button"); btn.className="copy"; btn.textContent="Copiar";
    btn.addEventListener("click", ()=>{ const code=pre.querySelector("code")?.innerText||pre.innerText; navigator.clipboard.writeText(code); btn.textContent="Copiado ✓"; setTimeout(()=>btn.textContent="Copiar",1100); });
    pre.parentNode.insertBefore(head, pre); head.appendChild(btn);
  });

  row.appendChild(av); row.appendChild(bub); msgs.appendChild(row);
  requestAnimationFrame(()=>{ msgs.scrollTop = msgs.scrollHeight; });
  saveToHistory(role, mdText);
}
function userMsg(text){ render("user", escapeHTML(text)); }
function botMsg(text){ render("assistant", text); }
function showTyping(v){ typing.style.display = v ? "flex" : "none"; }

/***** Markdown mínimo *****/
function mdToHTML(md){
  md = md.replace(/```([\s\S]*?)```/g, (_,code)=> `<pre><code>${escapeHTML(code.trim())}</code></pre>`);
  md = md.replace(/^### (.*)$/gim,'<h3>$1</h3>').replace(/^## (.*)$/gim,'<h2>$1</h2>').replace(/^# (.*)$/gim,'<h1>$1</h1>').replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/`([^`]+?)`/g,'<code>$1</code>');
  const lines = md.split('\n').map(line=>{
    if (/^\s*-\s+/.test(line)) return `<li>${line.replace(/^\s*-\s+/, '')}</li>`;
    if (/^\s*•\s+/.test(line)) return `<li>${line.replace(/^\s*•\s+/, '')}</li>`;
    if (/^<h\d|^<pre|^<ul|^<li|^<\/li|^<\/ul|^<a /.test(line)) return line;
    return line.trim()? `<p>${line}</p>` : '<p style="margin:4px 0"></p>';
  });
  return lines.join('\n').replace(/(?:<li>[\s\S]*?<\/li>\n?)+/g, m => `<ul>${m}</ul>`);
}
function escapeHTML(s){return (s||'').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}
function norm(s){return (s||'').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,'').replace(/[^a-z0-9áéíóúñü\s]/g,' ').replace(/\s+/g,' ').trim();}

/***** Validaciones *****/
function isValidPhone(v){ const d=onlyDigits(v); return /^57\d{10}$/.test(d)||/^\d{10}$/.test(d); }
function cleanPhone(v){ let d=onlyDigits(v); if (/^\d{10}$/.test(d)) d="57"+d; return d; }
function onlyDigits(s){ return (s||'').replace(/\D+/g,''); }

/***** Persistencia *****/
function saveToHistory(role,text){ const arr=JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]"); arr.push({role,text,t:Date.now()}); localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); }
function restoreHistory(){
  const arr=JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]"); if (!arr.length) return;
  arr.forEach(m=>{ m.role==='assistant'?botMsg(m.text):userMsg(m.text); });
  const savedFlow = loadFlowState(); if (savedFlow?.activo){ flow=savedFlow; botMsg("Teníamos un **flujo de cotización** pendiente. ¿Deseas **continuar**? Escribe `cancelar` para salir."); }
}
function historyEmpty(){ const arr=JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]"); return arr.length===0; }
function saveFlowState(){ localStorage.setItem(FLOW_KEY, JSON.stringify(flow)); }
function loadFlowState(){ try{ return JSON.parse(localStorage.getItem(FLOW_KEY)||"null"); }catch{ return null; } }
