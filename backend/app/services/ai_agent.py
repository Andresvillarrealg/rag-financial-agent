import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_community.vectorstores import FAISS
from langchain_text_splitters import RecursiveCharacterTextSplitter

load_dotenv()

class PlataformaAgent:
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        
        self.llm = ChatOpenAI(openai_api_key=api_key, model_name="gpt-3.5-turbo", temperature=0.2)
        self.embeddings = OpenAIEmbeddings(openai_api_key=api_key)
        
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000, 
            chunk_overlap=100
        )
        
        # 1. Definimos la ruta de la carpeta interna del contenedor donde vivirá la memoria
        self.ruta_memoria = "/app/data/faiss_index"
        
        # 2. Intentamos cargar la memoria si el servidor se acaba de reiniciar
        if os.path.exists(self.ruta_memoria):
            self.vector_store = FAISS.load_local(
                folder_path=self.ruta_memoria, 
                embeddings=self.embeddings, 
                allow_dangerous_deserialization=True 
            )
            print("Memoria vectorial cargada desde el disco.")
        else:
            self.vector_store = None 
            print("Iniciando con memoria vectorial limpia.")

    def ingestar_documento(self, texto: str) -> str:
        try:
            chunks = self.text_splitter.split_text(texto)
            
            if self.vector_store is None:
                # Si no había memoria, la creamos por primera vez
                self.vector_store = FAISS.from_texts(chunks, self.embeddings)
            else:
                # Si ya existía, agregamos los nuevos fragmentos a la base existente
                self.vector_store.add_texts(chunks)
            
            # 3. Guardamos los cambios físicamente en el disco
            os.makedirs("/app/data", exist_ok=True)
            self.vector_store.save_local(self.ruta_memoria)
            
            return f"{len(chunks)} fragmentos vectorizados y guardados en el disco duro permanentemente."
        except Exception as e:
            return f"Error al procesar el documento: {str(e)}"

    def consultar(self, mensaje_usuario: str) -> str:
        contexto_extra = ""
        
        if self.vector_store is not None:
            documentos_relevantes = self.vector_store.similarity_search(mensaje_usuario, k=3)
            contexto_extra = "\n\n".join([doc.page_content for doc in documentos_relevantes])
        
        if contexto_extra:
            prompt_sistema = f"Eres un analista experto. Responde a la pregunta del usuario utilizando ÚNICAMENTE el siguiente contexto. Si no sabes la respuesta basada en el contexto, dilo.\n\nCONTEXTO:\n{contexto_extra}"
        else:
            prompt_sistema = "Eres un ingeniero de IA experto en análisis de datos. Responde de forma concisa."

        mensajes = [
            SystemMessage(content=prompt_sistema),
            HumanMessage(content=mensaje_usuario)
        ]
        
        try:
            respuesta = self.llm.invoke(mensajes)
            return respuesta.content
        except Exception as e:
            return f"Error en el modelo: {str(e)}"

agente_ia = PlataformaAgent()