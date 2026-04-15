import { useRef, useEffect, useCallback } from 'react';

interface MinimalRichEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * Editor de texto enriquecido mínimo.
 * Soporta únicamente: negritas (<strong>) y listas de puntos (<ul><li>).
 * No requiere dependencias externas — usa contentEditable nativo.
 */
const MinimalRichEditor = ({
  value,
  onChange,
  placeholder = 'Escribe aquí...',
  disabled = false,
}: MinimalRichEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  // Inicializar contenido solo una vez
  useEffect(() => {
    if (editorRef.current && !isInitialized.current) {
      editorRef.current.innerHTML = value || '';
      isInitialized.current = true;
    }
  }, [value]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const applyBold = () => {
    if (disabled) return;
    editorRef.current?.focus();
    document.execCommand('bold', false);
    handleInput();
  };

  const applyBulletList = () => {
    if (disabled) return;
    editorRef.current?.focus();
    document.execCommand('insertUnorderedList', false);
    handleInput();
  };

  const isEmpty = !value || value === '<br>' || value === '';

  return (
    <div className="border border-gray-300 rounded-md overflow-hidden">
      {/* Barra de herramientas */}
      <div className="flex gap-1 px-2 py-1 bg-gray-50 border-b border-gray-200">
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            applyBold();
          }}
          disabled={disabled}
          className="px-2 py-0.5 text-sm font-bold border border-gray-300 rounded hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
          title="Negrita"
        >
          B
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            applyBulletList();
          }}
          disabled={disabled}
          className="px-2 py-0.5 text-sm border border-gray-300 rounded hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
          title="Lista de puntos"
        >
          • Lista
        </button>
      </div>

      {/* Área editable */}
      <div className="relative">
        {isEmpty && (
          <span className="absolute top-2 left-3 text-gray-400 text-sm pointer-events-none select-none">
            {placeholder}
          </span>
        )}
        <div
          ref={editorRef}
          contentEditable={!disabled}
          suppressContentEditableWarning
          onInput={handleInput}
          className={[
            'min-h-[80px] px-3 py-2 text-sm outline-none',
            '[&_ul]:list-disc [&_ul]:ml-4',
            '[&_strong]:font-bold',
            disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white',
          ].join(' ')}
        />
      </div>
    </div>
  );
};

export default MinimalRichEditor;
