// Estado de la aplicación
const state = {
    currentStep: 1,
    botConfig: {
        name: '',
        purpose: '',
        tone: 'friendly'
    },
    sources: {
        files: [],
        urls: []
    },
    trained: false
};

// Navegación entre pasos
function updateProgress() {
    const progress = document.getElementById('progress');
    const percentage = ((state.currentStep - 1) / 3) * 100;
    progress.style.width = `${percentage}%`;
    
    // Actualizar indicadores de pasos
    document.querySelectorAll('.step').forEach((step, index) => {
        const stepNum = index + 1;
        if (stepNum < state.currentStep) {
            step.classList.add('completed');
            step.classList.remove('active');
        } else if (stepNum === state.currentStep) {
            step.classList.add('active');
            step.classList.remove('completed');
        } else {
            step.classList.remove('active', 'completed');
        }
    });
    
    // Mostrar/ocultar contenido del paso actual
    document.querySelectorAll('.step-content').forEach(content => {
        if (parseInt(content.dataset.step) === state.currentStep) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });
}

function nextStep(step) {
    // Validar paso actual antes de avanzar
    if (state.currentStep === 1) {
        state.botConfig.name = document.getElementById('bot-name').value;
        state.botConfig.purpose = document.getElementById('bot-purpose').value;
        state.botConfig.tone = document.getElementById('bot-tone').value;
        
        if (!state.botConfig.name || !state.botConfig.purpose) {
            alert('Por favor, completa todos los campos obligatorios.');
            return;
        }
    }
    
    state.currentStep = step;
    updateProgress();
}

function prevStep(step) {
    state.currentStep = step;
    updateProgress();
}

// Gestión de fuentes
function addUrl() {
    const urlInput = document.getElementById('url-input');
    const url = urlInput.value.trim();
    
    if (!url) return;
    
    // Validar formato de URL
    try {
        new URL(url);
        state.sources.urls.push(url);
        urlInput.value = '';
        updateSourceList();
    } catch (e) {
        alert('Por favor, ingresa una URL válida.');
    }
}

function updateSourceList() {
    const sourceList = document.getElementById('source-list');
    sourceList.innerHTML = '';
    
    if (state.sources.files.length === 0 && state.sources.urls.length === 0) {
        sourceList.innerHTML = '<div class="source-item"><span>No has agregado fuentes aún</span></div>';
        return;
    }
    
    state.sources.files.forEach((file, index) => {
        const item = document.createElement('div');
        item.className = 'source-item';
        item.innerHTML = `
            <span>${file.name}</span>
            <button class="btn btn-secondary" onclick="removeFile(${index})">Eliminar</button>
        `;
        sourceList.appendChild(item);
    });
    
    state.sources.urls.forEach((url, index) => {
        const item = document.createElement('div');
        item.className = 'source-item';
        item.innerHTML = `
            <span>${url}</span>
            <button class="btn btn-secondary" onclick="removeUrl(${index})">Eliminar</button>
        `;
        sourceList.appendChild(item);
    });
}

function removeFile(index) {
    state.sources.files.splice(index, 1);
    updateSourceList();
}

function removeUrl(index) {
    state.sources.urls.splice(index, 1);
    updateSourceList();
}

// Manejo de subida de archivos
function setupFileUpload() {
    const fileInput = document.getElementById('file-input');
    
    fileInput.addEventListener('change', function(e) {
        const files = Array.from(e.target.files);
        
        // Validar tipos de archivo (opcional)
        const validTypes = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        const invalidFiles = files.filter(file => !validTypes.includes(file.type));
        
        if (invalidFiles.length > 0) {
            alert('Algunos archivos no son del tipo permitido (PDF, TXT, DOCX).');
            // Filtrar solo los archivos válidos
            state.sources.files = state.sources.files.concat(
                files.filter(file => validTypes.includes(file.type))
            );
        } else {
            state.sources.files = state.sources.files.concat(files);
        }
        
        updateSourceList();
    });
}

// Entrenamiento del bot
function trainBot() {
    if (state.sources.files.length === 0 && state.sources.urls.length === 0) {
        alert('Debes agregar al menos una fuente de información antes de entrenar el bot.');
        return;
    }
    
    // Simular proceso de entrenamiento
    const trainingStatus = document.querySelector('.training-status');
    trainingStatus.innerHTML = `
        <div style="margin-bottom: 1rem;">
            <div style="width: 50px; height: 50px; border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
        </div>
        <h3>Entrenando tu bot...</h3>
        <p>Esto puede tomar unos momentos.</p>
    `;
    
    // Simular tiempo de entrenamiento
    setTimeout(() => {
        trainingStatus.innerHTML = `
            <div class="status-icon">✓</div>
            <h3>¡Entrenamiento completado!</h3>
            <p>Tu bot ahora está listo para responder preguntas.</p>
            <div class="success-details" style="margin-top: 1rem; text-align: left;">
                <p><span class="success-checkmark">✓</span> ${state.sources.files.length} documento(s) procesado(s)</p>
                <p><span class="success-checkmark">✓</span> ${state.sources.urls.length} URL(s) analizada(s)</p>
                <p><span class="success-checkmark">✓</span> Modelo de lenguaje configurado</p>
            </div>
        `;
        state.trained = true;
    }, 3000);
}

// Chat con el bot
function sendMessage() {
    const input = document.getElementById('user-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    const chatMessages = document.getElementById('chat-messages');
    
    // Agregar mensaje del usuario
    const userMessage = document.createElement('div');
    userMessage.className = 'message user-message';
    userMessage.textContent = message;
    chatMessages.appendChild(userMessage);
    
    // Limpiar input
    input.value = '';
    
    // Simular respuesta del bot
    setTimeout(() => {
        const botMessage = document.createElement('div');
        botMessage.className = 'message bot-message';
        
        // Respuesta simple basada en palabras clave
        if (message.toLowerCase().includes('hola') || message.toLowerCase().includes('buenos días') || message.toLowerCase().includes('buenas tardes')) {
            botMessage.textContent = '¡Hola! ¿En qué puedo ayudarte hoy?';
        } else if (message.toLowerCase().includes('nombre')) {
            botMessage.textContent = `Mi nombre es ${state.botConfig.name || 'tu asistente virtual'}.`;
        } else if (message.toLowerCase().includes('gracias')) {
            botMessage.textContent = '¡De nada! Estoy aquí para ayudarte cuando me necesites.';
        } else if (message.toLowerCase().includes('adiós') || message.toLowerCase().includes('chao') || message.toLowerCase().includes('hasta luego')) {
            botMessage.textContent = '¡Hasta luego! Fue un placer ayudarte.';
        } else {
            botMessage.textContent = 'He procesado tu solicitud. Basándome en la información proporcionada, puedo decirte que...';
            
            // Simular una respuesta más elaborada si hay fuentes
            if (state.sources.files.length > 0 || state.sources.urls.length > 0) {
                botMessage.textContent += ' he encontrado información relevante en las fuentes proporcionadas. ¿Hay algo más específico que te gustaría saber?';
            } else {
                botMessage.textContent += ' aunque no tengo fuentes específicas de información para consultar.';
            }
        }
        
        chatMessages.appendChild(botMessage);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 1000);
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Exportar bot
function exportBot() {
    if (!state.trained) {
        alert('Debes entrenar el bot antes de exportarlo.');
        return;
    }
    
    // Simular proceso de exportación
    alert(`¡Bot "${state.botConfig.name}" exportado con éxito!\n\nPuedes implementarlo en tu sitio web usando el código que se ha generado.`);
    
    // En una implementación real, aquí se proporcionaría el código de inserción
    // o se descargaría un archivo de configuración
}

// Inicialización
function init() {
    // Configurar eventos
    document.getElementById('user-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Configurar subida de archivos
    setupFileUpload();
    
    // Inicializar progreso
    updateProgress();
}

// Iniciar la aplicación cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}