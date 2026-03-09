import { useState, useRef, useEffect } from 'react';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600&family=Instrument+Serif:ital@0;1&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html, body, #root {
    min-height: 100vh;
    width: 100%;
  }

  body {
    background: #f5f4f0;
    font-family: 'Instrument Sans', sans-serif;
    color: #1a1a1a;
    display: flex;
    justify-content: center;
  }

  #root {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .app-wrapper {
    width: 100%;
    max-width: 720px;
    padding: 48px 24px 40px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  /* Header */
  .header { margin-bottom: 8px; }

  .header-title {
    font-family: 'Instrument Serif', serif;
    font-size: 30px;
    font-weight: 400;
    color: #1a1a1a;
    letter-spacing: -0.3px;
  }

  .header-title em {
    font-style: italic;
    color: #6b6b6b;
  }

  .header-sub {
    font-size: 13px;
    color: #999;
    margin-top: 4px;
  }

  /* Divider */
  .divider {
    height: 1px;
    background: #e5e3de;
  }

  /* Section label */
  .section-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    color: #aaa;
    margin-bottom: 12px;
  }

  /* Upload */
  .upload-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .file-input-wrapper {
    position: relative;
    flex: 1;
  }

  .file-input-wrapper input[type="file"] {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
    width: 100%;
    height: 100%;
  }

  .file-display {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    background: #fff;
    border: 1px solid #e0ddd8;
    border-radius: 8px;
    font-size: 13px;
    color: #bbb;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .file-display:hover { border-color: #bbb; color: #555; }
  .file-display.has-file { color: #333; border-color: #c9c6c0; }

  .btn-upload {
    padding: 10px 18px;
    background: #1a1a1a;
    border: none;
    border-radius: 8px;
    color: #fff;
    font-family: 'Instrument Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.15s, transform 0.1s;
  }

  .btn-upload:hover { background: #333; }
  .btn-upload:active { transform: scale(0.98); }

  /* Chat window */
  .chat-window {
    height: 400px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    overflow-y: auto;
    padding: 2px 0 4px;
    scrollbar-width: thin;
    scrollbar-color: #ddd transparent;
  }

  .chat-window::-webkit-scrollbar { width: 4px; }
  .chat-window::-webkit-scrollbar-thumb { background: #ddd; border-radius: 4px; }

  .chat-empty {
    margin: auto;
    text-align: center;
    color: #bbb;
    font-size: 13px;
    line-height: 1.8;
  }

  .msg-row {
    display: flex;
    animation: msgIn 0.25s ease both;
  }

  @keyframes msgIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .msg-row.user { justify-content: flex-end; }
  .msg-row.ai   { justify-content: flex-start; }

  .bubble {
    max-width: 75%;
    padding: 11px 15px;
    border-radius: 12px;
    font-size: 14px;
    line-height: 1.6;
    word-break: break-word;
  }

  .bubble.user {
    background: #1a1a1a;
    color: #f5f4f0;
    border-bottom-right-radius: 3px;
  }

  .bubble.ai {
    background: #fff;
    color: #1a1a1a;
    border: 1px solid #e5e3de;
    border-bottom-left-radius: 3px;
  }

  /* Input bar */
  .input-bar {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .text-input {
    flex: 1;
    padding: 12px 16px;
    background: #fff;
    border: 1px solid #e0ddd8;
    border-radius: 8px;
    color: #1a1a1a;
    font-family: 'Instrument Sans', sans-serif;
    font-size: 14px;
    outline: none;
    transition: border-color 0.15s;
  }

  .text-input::placeholder { color: #bbb; }
  .text-input:focus { border-color: #aaa; }

  .btn-send {
    padding: 12px 20px;
    background: #1a1a1a;
    border: none;
    border-radius: 8px;
    color: #fff;
    font-family: 'Instrument Sans', sans-serif;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s, transform 0.1s;
    white-space: nowrap;
  }

  .btn-send:hover { background: #333; }
  .btn-send:active { transform: scale(0.98); }
`;

export default function App() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [file, setFile] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleChat = async () => {
    if (!query.trim()) return;
    const newMessages = [...messages, { role: 'user', text: query }];
    setMessages(newMessages);
    setQuery('');

    try {
      const response = await fetch(`http://localhost:8000/api/chat?query=${encodeURIComponent(query)}`, {
        method: 'POST',
        headers: { 'accept': 'application/json' }
      });
      const data = await response.json();
      setMessages([...newMessages, { role: 'ai', text: data.response }]);
    } catch {
      setMessages([...newMessages, { role: 'ai', text: 'Error de conexión con el motor de IA.' }]);
    }
  };

  const handleUpload = async () => {
    if (!file) { alert('Por favor selecciona un archivo primero.'); return; }
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch('http://localhost:8000/api/upload', { method: 'POST', body: formData });
      const data = await response.json();
      alert('Éxito: ' + data.message);
    } catch {
      alert('Error al conectar con el servidor para la subida.');
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="app-wrapper">

        <div className="header">
          <div className="header-title">Agente de <em>Análisis</em> Inteligente</div>
          <div className="header-sub">Sube un documento y haz preguntas sobre él.</div>
        </div>

        <div className="divider" />

        <div>
          <div className="section-label">Ingesta de datos</div>
          <div className="upload-row">
            <div className="file-input-wrapper">
              <input type="file" onChange={(e) => setFile(e.target.files[0])} />
              <div className={`file-display ${file ? 'has-file' : ''}`}>
                {file ? `📄 ${file.name}` : 'Seleccionar archivo PDF / TXT'}
              </div>
            </div>
            <button className="btn-upload" onClick={handleUpload}>Subir a FAISS</button>
          </div>
        </div>

        <div className="divider" />

        <div>
          <div className="section-label">Conversación</div>
          <div className="chat-window">
            {messages.length === 0 ? (
              <div className="chat-empty">
                Motor listo.<br />Haz una pregunta o sube un documento.
              </div>
            ) : (
              messages.map((msg, i) => (
                <div className={`msg-row ${msg.role}`} key={i}>
                  <div className={`bubble ${msg.role}`}>{msg.text}</div>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>
        </div>

        <div className="divider" />

        <div className="input-bar">
          <input
            className="text-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleChat()}
            placeholder="Consulta al modelo sobre el documento..."
          />
          <button className="btn-send" onClick={handleChat}>Enviar</button>
        </div>

      </div>
    </>
  );
}