# Agente de Análisis Inteligente RAG 

Un sistema integral de **Retrieval-Augmented Generation (RAG)** diseñado para la ingesta, vectorización y análisis interactivo de documentos corporativos (PDF y TXT). Esta solución de automatización permite a los usuarios "conversar" con sus datos, garantizando respuestas fundamentadas (grounded) basadas exclusivamente en el contexto proporcionado, minimizando alucinaciones.

## Arquitectura del Sistema

El proyecto está construido con una arquitectura moderna, modular y en contenedores, separando claramente las responsabilidades:

* **Frontend (React.js):** Interfaz de usuario reactiva para la carga asíncrona de documentos y visualización del chat en tiempo real.
* **Backend (FastAPI):** Servidor asíncrono en Python que expone endpoints RESTful para la comunicación entre el cliente y el motor de IA. Soporta procesamiento de archivos de texto y extracción de metadatos de PDFs mediante `pypdf`.
* **Motor de IA (LangChain & OpenAI):** Orquestador lógico que gestiona la fragmentación de documentos (`RecursiveCharacterTextSplitter`), la generación de embeddings y el diseño del *Prompt Engineering*.
* **Base de Datos Vectorial (FAISS):** Almacenamiento local de alta eficiencia para búsquedas de similitud.
* **Infraestructura (Docker & Docker Compose):** Contenedorización completa que garantiza entornos reproducibles. Incluye **volúmenes persistentes** para evitar la pérdida del índice vectorial entre reinicios del servidor.

## Características Principales

1. **Ingesta de Múltiples Formatos:** Soporte nativo para lectura y extracción de texto de archivos `.txt` y `.pdf`.
2. **Memoria Persistente:** El índice vectorial de FAISS se guarda en un volumen local montado de Docker, permitiendo conservar el conocimiento sin necesidad de re-procesar los documentos tras apagar el sistema.
3. **Mitigación de Alucinaciones:** El agente está instruido (System Prompt) para responder estrictamente utilizando los fragmentos recuperados de la base de datos vectorial.
4. **Despliegue Aislado:** Resolución de dependencias a bajo nivel gestionada automáticamente por la capa de Dockerización.

## Guía de Instalación y Ejecución

### Prerrequisitos
* [Docker](https://www.docker.com/) y Docker Compose instalados.
* Una API Key de [OpenAI](https://platform.openai.com/).

### Pasos

**1. Clonar el repositorio:**
```bash
git clone [https://github.com/tu-usuario/tu-repositorio.git](https://github.com/tu-usuario/tu-repositorio.git)
cd tu-repositorio
```

**2. Configurar las variables de entorno:**
En la carpeta `/backend`, crea un archivo llamado `.env` y agrega tu llave de OpenAI:
```env
OPENAI_API_KEY=sk-tu_llave_secreta_aqui
```

**3. Construir y levantar la infraestructura:**
Ejecuta el siguiente comando en la raíz del proyecto para descargar las imágenes, compilar el entorno y levantar los servidores:
```bash
docker compose up --build
```

**4. Uso de la aplicación:**
* Abre tu navegador y ve a `http://localhost:5173`.
* En la sección "Ingesta de Datos", selecciona un archivo PDF o TXT y haz clic en **Subir a FAISS**.
* Una vez procesado, utiliza el chat inferior para hacer preguntas analíticas sobre el documento.

