// 💡 Coloca aquí tu API KEY de Gemini
const GEMINI_API_KEY = "AIzaSyAuUIImCj2hoZ9roeJspQPuU2OzITr9ECA";

// Carga memoria previa desde localStorage
let baseDeConocimiento = JSON.parse(localStorage.getItem("ia_conocimiento")) || [];

// Guarda en localStorage
function guardarMemoria() {
  localStorage.setItem("ia_conocimiento", JSON.stringify(baseDeConocimiento));
}

// Limpia la memoria del bot
function limpiarMemoria() {
  localStorage.removeItem("ia_conocimiento");
  baseDeConocimiento = [];
  alert("Memoria borrada correctamente");
  document.getElementById("chatbox").innerHTML = "<p><strong>IA:</strong> Memoria limpia. Puedes entrenarme de nuevo.</p>";
}

// Muestra mensaje en el chat
function agregarMensaje(remitente, texto) {
  const chat = document.getElementById("chatbox");
  const p = document.createElement("p");
  p.innerHTML = `<strong>${remitente}:</strong> ${texto}`;
  chat.appendChild(p);
  chat.scrollTop = chat.scrollHeight;
}

// Función principal: envía pregunta y obtiene respuesta desde Gemini
async function enviarPregunta() {
  const input = document.getElementById("userInput");
  const pregunta = input.value.trim();
  if (!pregunta) return;

  agregarMensaje("Tú", pregunta);

  const contexto = baseDeConocimiento
    .map(pair => `P: ${pair.pregunta}\nR: ${pair.respuesta}`)
    .slice(-10)
    .join("\n\n");

  await responderConGemini(pregunta, contexto);
  input.value = "";
}

// Conecta con Gemini 2.5 usando tu API key
async function responderConGemini(pregunta, contexto = "") {
  const prompt = `
Responde a esta pregunta de forma clara y útil usando el siguiente contexto si es relevante:

${contexto}

Pregunta:
${pregunta}
`;

  const body = {
    contents: [{ parts: [{ text: prompt }] }]
  };

  try {
    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      }
    );

    const data = await res.json();
    const texto = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (texto) {
      agregarMensaje("IA", texto);
    } else {
      agregarMensaje("IA", "No pude generar una respuesta con Gemini.");
      console.error(data);
    }
  } catch (err) {
    console.error("Error al conectar con Gemini:", err);
    agregarMensaje("IA", "Hubo un error al consultar la IA de Google.");
  }
}

// Entrena el bot desde una URL pública con texto
async function entrenarDesdeURL() {
  const url = document.getElementById("urlInput").value;
  if (!url) return alert("Por favor, pega una URL válida");

  try {
    const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
    const data = await response.json();
    const html = data.contents;

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const texto = doc.body.innerText;

    const bloques = texto.split("\n").map(t => t.trim()).filter(t => t.length > 40 && t.length < 300);
    let nuevos = 0;

    for (let i = 0; i < bloques.length - 1; i++) {
      const pregunta = bloques[i];
      const respuesta = bloques[i + 1];

      if (pregunta.endsWith("?") && respuesta.length > 40) {
        baseDeConocimiento.push({ pregunta, respuesta });
        nuevos++;
      }
    }

    guardarMemoria();
    alert(`Entrenamiento completo. Se añadieron ${nuevos} pares pregunta/respuesta.`);
    agregarMensaje("IA", `He aprendido ${nuevos} datos nuevos de esa página.`);
  } catch (error) {
    console.error("Error al entrenar desde URL:", error);
    alert("No pude leer el contenido. Intenta con otra URL.");
  }
}
