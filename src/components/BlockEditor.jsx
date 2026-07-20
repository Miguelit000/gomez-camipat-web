import { useEffect, useRef } from 'react';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import ImageTool from '@editorjs/image';

export default function BlockEditor({ initialContent, onChange }) {
  const editorInstance = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!editorInstance.current && containerRef.current) {
      let parsedData = {};
      
      if (initialContent) {
        try {
          parsedData = JSON.parse(initialContent);
        } catch (e) {
          parsedData = {
            blocks: [
              {
                type: "paragraph",
                data: { text: initialContent }
              }
            ]
          };
        }
      }

      const editor = new EditorJS({
        holder: containerRef.current,
        data: parsedData,
        placeholder: 'Escribe tu análisis, confluencias institucionales o pega capturas de pantalla aquí...',
        tools: {
          header: {
            class: Header,
            config: { levels: [2, 3, 4], defaultLevel: 2 }
          },
          list: {
            class: List,
            inlineToolbar: true
          },
          image: {
            class: ImageTool,
            config: {
              endpoints: {
                byFile: 'http://localhost:8080/api/v1/trades/editor/image',
              },
              field: 'file', 
              // ELIMINAMOS additionalRequestHeaders Y USAMOS ESTO:
              additionalRequestConfig: {
                credentials: 'include' // <-- Le dice a Editor.js que envíe la Cookie segura
              }
            }
          }
        },
        onChange: async () => {
          const content = await editor.saver.save();
          onChange(JSON.stringify(content));
        }
      });

      editorInstance.current = editor;
    }

    return () => {
      if (editorInstance.current && typeof editorInstance.current.destroy === 'function') {
        editorInstance.current.destroy();
        editorInstance.current = null;
      }
    };
  }, []); 

  return (
    <div 
      ref={containerRef} 
      style={{ 
        background: '#ffffff', 
        borderRadius: '6px', 
        border: '1px solid #cbd5e1', 
        padding: '15px', 
        minHeight: '200px',
        color: '#1e293b',
        boxSizing: 'border-box'
      }}
    />
  );
}