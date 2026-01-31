/**
 * @fileoverview Modal para registrar información de una ausencia injustificada
 * @module presentation/features/attendance/JustificationModal
 *
 * Se abre cuando el docente marca una falta injustificada.
 * El docente debe redactar la información de la ausencia (campo obligatorio).
 * Opcionalmente puede indicar si hay soporte documental (excusa).
 */

import { useState, useEffect, useRef } from 'react';
import { IconX, IconAlertCircle } from '@tabler/icons-react';

// ============================================
// Props
// ============================================

interface JustificationModalProps {
  open: boolean;
  fecha: string;
  studentName: string;
  hora: string;
  onSave: (motivo: string, conExcusa: boolean) => void;
  onCancel: () => void;
}

// ============================================
// Componente
// ============================================

export default function JustificationModal({
  open,
  fecha,
  studentName,
  hora,
  onSave,
  onCancel,
}: JustificationModalProps) {
  const [motivo, setMotivo]       = useState('');
  const [conExcusa, setConExcusa] = useState(false);
  const [error, setError]         = useState(false);
  const textareaRef               = useRef<HTMLTextAreaElement>(null);

  // Resetear estado cuando se abre
  useEffect(() => {
    if (open) {
      setMotivo('');
      setConExcusa(false);
      setError(false);
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [open]);

  function handleSave() {
    if (!motivo.trim()) {
      setError(true);
      textareaRef.current?.focus();
      return;
    }
    onSave(motivo.trim(), conExcusa);
  }

  if (!open) return null;

  // Formato de fecha legible
  const fechaLabel = (() => {
    const d = new Date(fecha + 'T00:00:00');
    return d.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_24px_64px_rgba(0,0,0,.18)] w-full max-w-[520px] overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 bg-gray-50 px-4 py-3.5">
          <div>
            <h2 className="text-[14px] font-bold text-gray-800">Registrar excusa</h2>
            <p className="mt-0.5 text-[11px] text-gray-500">
              <strong>{studentName}</strong> — {fechaLabel} · Hora {hora}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-100 transition-all"
          >
            <IconX size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3">
          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-[11px] text-red-700">
              <IconAlertCircle size={14} className="text-red-500 flex-shrink-0" />
              El motivo es obligatorio.
            </div>
          )}

          {/* Motivo (obligatorio) */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">
              Información de la excusa <span className="text-red-500">*</span>
            </label>
            <textarea
              ref={textareaRef}
              value={motivo}
              onChange={(e) => { setMotivo(e.target.value); if (e.target.value.trim()) setError(false); }}
              placeholder="Ej: El estudiante presenta excusa por enfermedad. Se adjunta soporte documental…"
              rows={3}
              className={`w-full resize-y rounded-xl border px-3 py-2 text-[12px] text-gray-700 outline-none transition-all focus:ring-2 focus:ring-indigo-200 ${
                error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white focus:border-indigo-300'
              }`}
            />
          </div>

          {/* Con soporte / excusa */}
          <label className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-all">
            <input
              type="checkbox"
              checked={conExcusa}
              onChange={(e) => setConExcusa(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-indigo-500 focus:ring-indigo-200"
            />
            <div>
              <span className="text-[12px] font-semibold text-gray-700">Con soporte documental</span>
              <p className="text-[10px] text-gray-400 mt-0.5">El estudiante presentará un documento que respalde la excusa</p>
            </div>
          </label>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-gray-100 bg-white px-4 py-3">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-[11px] font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 text-[11px] font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-700 active:bg-amber-800 transition-all shadow-sm shadow-amber-200"
          >
            Guardar excusa
          </button>
        </div>
      </div>
    </div>
  );
}
