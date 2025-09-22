// server.js — Backend Gemini genérico con historial, grounding y web opcional
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import { GoogleGenAI } from '@google/genai';

const app = express();
app.use(cors({ origin: ['https://gold-snail-248674.hostingersite.com'] }));
app.use(express.json());

// === Config ===
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const STRICT_CONTEXT = (process.env.STRICT_CONTEXT ?? 'true') === 'true'; // solo responder con lo que haya en contexto

// Utilidad: limpiar HTML a texto y colapsar espacios
const stripHtml = (s="") => String(s||"")
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&[a-z]+;/gi, ' ')
  .replace(/\s+/g, ' ')
  .trim();
const squash = (s="") => String(s||"").replace(/\s+/g,' ').trim();

async function snapshotUrl(url){
  try{
    const r = await fetch(url, { timeout: 12000 });
    const ct = (r.headers.get('content-type')||'').toLowerCase();
    const raw = await r.text();
    const text = ct.includes('html') ? stripHtml(raw) : squash(raw);
    return { url, ok:true, text: text.slice(0, 6000) };
  }catch(err){
    return { url, ok:false, error: String(err) };
  }
}

// POST /chat
// body: {
//   message: string,
//   context?: string[],
//   titles?: string[],
//   history?: {role:'user'|'assistant',text:string}[],
//   profile?: { name?:string, goal?:string, notes?:string },
//   allowWeb?: boolean,
//   webUrls?: string[],
//   strictContext?: boolean   // opcional, sobreescribe STRICT_CONTEXT
// }
app.post('/chat', async (req, res) => {
  try{
    const {
      message,
      context = [],
      titles = [],
      history = [],
      profile = {},
      allowWeb = false,
      webUrls = [],
      strictContext
    } = req.body || {};

    if (!message || !message.trim()){
      return res.status(400).json({ error: "Falta 'message'." });
    }

    // 1) Historial breve
    const histLines = (history||[]).slice(-8).map(m=>{
      const role = m.role === 'assistant' ? 'Asistente' : 'Usuario';
      return `• ${role}: ${squash(m.text)}`;
    }).join('\n');

    // 2) Contexto del RAG (títulos opcionales)
    const ctxBlocks = (context||[]).map((txt,i)=>{
      const head = titles?.[i] ? `# ${titles[i]}\n` : '';
      return head + squash(txt).slice(0, 1600);
    });

    // 3) Web como apoyo (opcional): traer snapshots de URLs indicadas
    let webBlocks = [];
    if (allowWeb && webUrls?.length){
      const snaps = await Promise.all(webUrls.slice(0,3).map(snapshotUrl));
      webBlocks = snaps.filter(s=>s.ok).map(s=> `# ${s.url}\n${s.text}`);
    }

    // 4) System: **GENÉRICO**, anclado a contexto; NO revelar modelo
    const onlyContext = (strictContext ?? STRICT_CONTEXT);
    const systemText = [
      "Actúas como asistente del negocio configurado. Responde SIEMPRE en español, tono cercano y profesional.",
      onlyContext
        ? "Regla: responde SOLO con la información disponible en CONTEXTO/HISTORIAL. Si falta información, dilo y pide lo mínimo para avanzar."
        : "Regla: prioriza CONTEXTO/HISTORIAL; si falta información, puedes razonar brevemente pero pide los datos mínimos.",
      "Prohibido afirmar que eres un modelo/IA (Gemini/ChatGPT, etc.). Si preguntan por el modelo, responde: 'Soy el asistente virtual de este sitio'.",
      "Estructura: 1) respuesta breve y clara, 2) siguiente paso/acción, 3) si aplica, una pregunta de aclaración.",
      profile.name ? `Nombre del bot: ${profile.name}` : "",
      profile.goal ? `Objetivo del bot: ${profile.goal}` : "",
      profile.notes ? `Notas internas: ${profile.notes}` : ""
    ].filter(Boolean).join('\n');

    // 5) Prompt del usuario, con HISTORIAL + CONTEXTO (+ WEB si hay)
    const userText =
`HISTORIAL (reciente):
${histLines || "(sin historial)"}

PREGUNTA:
${squash(message)}

CONTEXTO (de RAG):
${ctxBlocks.length ? ctxBlocks.join("\n\n---\n\n") : "(sin contexto de RAG)"}

WEB (capturas opcionales):
${webBlocks.length ? webBlocks.join("\n\n---\n\n") : "(sin web adicional)"}    
`;

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [{ role: "user", parts: [{ text: userText }]}],
      systemInstruction: { parts: [{ text: systemText }] },
      config: { temperature: 0.2 } // más enfocado en el contexto
    });

    const answer = (response?.text || "").trim() || "No tengo suficiente información en el contexto. ¿Deseas añadir un archivo o URL?";
    res.json({ answer });
  }catch(err){
    console.error("Gemini error:", err?.message || err);
    res.status(500).json({ error: "Error al consultar el servidor de IA." });
  }
});

app.get('/health', (_req,res)=>res.json({ok:true, model: MODEL, strict: STRICT_CONTEXT}));

app.listen(process.env.PORT || 3000, () => {
  console.log("AI server on", process.env.PORT || 3000, "model:", MODEL);
});
