/**
 * @fileoverview Panel lateral para ScheduleEditor con profesores, salones y asignaturas
 * @module presentation/features/schedule/components/FlexibleSchedulePanel
 */

import React from 'react';
import { IconUsers, IconBook, IconDoor, IconBulb, IconAlertTriangle, IconCheck } from '@tabler/icons-react';
import type { Area } from '../../../../domain/entities/area';
import type { ClassRoom } from '../../../../domain/entities/classRoom';

// ============================================
// Tipos
// ============================================

export interface DocenteOption {
  id: string;
  displayName?: string;
  email: string;
}

export interface FlexibleSchedulePanelProps {
  /** Lista de profesores */
  professors: DocenteOption[];
  /** Lista de salones */
  classrooms: ClassRoom[];
  /** Lista de áreas/asignaturas */
  areas: Area[];
  /** ID del profesor seleccionado */
  selectedProfId: string | null;
  /** ID del salón seleccionado */
  selectedRoomId: string | null;
  /** Callback al seleccionar/deseleccionar profesor */
  onSelectProf: (id: string | null) => void;
  /** Callback al seleccionar/deseleccionar salón */
  onSelectRoom: (id: string | null) => void;
  /** Callback al iniciar drag de área */
  onDragStartArea: (e: React.DragEvent<HTMLSpanElement>, area: Area) => void;
}

// ============================================
// Utilidades
// ============================================

const BADGE_COLORS = [
  'bg-red-100 text-red-700 border-red-200',
  'bg-amber-100 text-amber-700 border-amber-200',
  'bg-emerald-100 text-emerald-700 border-emerald-200',
  'bg-blue-100 text-blue-700 border-blue-200',
  'bg-purple-100 text-purple-700 border-purple-200',
  'bg-pink-100 text-pink-700 border-pink-200',
  'bg-orange-100 text-orange-700 border-orange-200',
  'bg-indigo-100 text-indigo-700 border-indigo-200',
  'bg-teal-100 text-teal-700 border-teal-200',
  'bg-cyan-100 text-cyan-700 border-cyan-200',
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function getBadgeColor(name: string): string {
  return BADGE_COLORS[hashString(name) % BADGE_COLORS.length];
}

// ============================================
// Componente
// ============================================

export const FlexibleSchedulePanel: React.FC<FlexibleSchedulePanelProps> = ({
  professors,
  classrooms,
  areas,
  selectedProfId,
  selectedRoomId,
  onSelectProf,
  onSelectRoom,
  onDragStartArea,
}) => {
  return (
    <div className="print:hidden w-48 flex-shrink-0 overflow-y-auto space-y-3 pr-1">
      {/* Instrucciones */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-3 shadow-sm">
        <div className="text-xs font-bold text-blue-900 mb-1.5 flex items-center gap-1.5">
          <IconBulb size={14} className="text-blue-600" />
          <span>Cómo crear clases</span>
        </div>
        <ol className="text-[10px] text-blue-800 space-y-1 list-decimal list-inside">
          <li>Selecciona un <strong>profesor</strong></li>
          <li>Selecciona un <strong>salón</strong></li>
          <li><strong>Arrastra</strong> una asignatura al horario</li>
        </ol>
      </div>

      {/* Profesores */}
      <div className="bg-white rounded-lg border border-gray-100 p-3 shadow-sm">
        <div className="flex items-center gap-1.5 mb-2">
          <IconUsers size={13} className="text-gray-400" />
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
            Profesores
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {professors.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelectProf(selectedProfId === p.id ? null : p.id)}
              className={`px-2.5 py-0.5 rounded-md text-xs font-semibold border transition-all ${
                selectedProfId === p.id
                  ? 'bg-indigo-500 text-white border-indigo-500 shadow-sm shadow-indigo-200'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
              }`}
            >
              {p.displayName || p.email}
            </button>
          ))}
        </div>
      </div>

      {/* Salones */}
      <div className="bg-white rounded-lg border border-gray-100 p-3 shadow-sm">
        <div className="flex items-center gap-1.5 mb-2">
          <IconDoor size={13} className="text-gray-400" />
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
            Salones
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {classrooms.map((r) => (
            <button
              key={r.id}
              onClick={() => onSelectRoom(selectedRoomId === r.id ? null : r.id)}
              className={`px-2.5 py-0.5 rounded-md text-xs font-semibold border transition-all ${
                selectedRoomId === r.id
                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-200'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300'
              }`}
            >
              {r.nombreSalon}
            </button>
          ))}
        </div>
      </div>

      {/* Asignaturas (drag sources) */}
      <div className="bg-white rounded-lg border border-gray-100 p-3 shadow-sm">
        <div className="flex items-center gap-1.5 mb-1">
          <IconBook size={13} className="text-gray-400" />
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
            Asignaturas
          </span>
        </div>
        <p className="text-[9px] text-gray-400 mb-2">Arrastra al horario</p>
        <div className="flex flex-wrap gap-1.5">
          {areas.map((a) => (
            <span
              key={a.id}
              draggable
              onDragStart={(e) => onDragStartArea(e, a)}
              className={`px-2.5 py-0.5 rounded-md text-xs font-semibold border cursor-grab active:cursor-grabbing select-none hover:shadow-sm transition-shadow ${getBadgeColor(
                a.asignatura
              )}`}
            >
              {a.asignatura}
            </span>
          ))}
        </div>

        {/* Hint si no hay selección */}
        {(!selectedProfId || !selectedRoomId) && (
          <div className="mt-2 text-[10px] text-amber-800 bg-amber-50 border border-amber-300 rounded-lg px-2 py-1.5 font-semibold flex items-center gap-1.5">
            <IconAlertTriangle size={12} className="text-amber-600 flex-shrink-0" />
            <span>
              {!selectedProfId && !selectedRoomId
                ? 'Selecciona un profesor y un salón'
                : !selectedProfId
                  ? 'Selecciona un profesor'
                  : 'Selecciona un salón'}
            </span>
          </div>
        )}

        {/* Hint cuando está listo */}
        {selectedProfId && selectedRoomId && (
          <div className="mt-2 text-[10px] text-green-800 bg-green-50 border border-green-300 rounded-lg px-2 py-1.5 font-semibold flex items-center gap-1.5">
            <IconCheck size={12} className="text-green-600 flex-shrink-0" />
            <span>¡Listo! Arrastra una asignatura o haz clic en el calendario</span>
          </div>
        )}
      </div>

      {/* Leyenda */}
      <div className="bg-white rounded-lg border border-gray-100 p-3 shadow-sm">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
          Leyenda
        </span>
        <div className="mt-1.5 space-y-1 text-[10px] text-gray-500">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm bg-emerald-50 border border-emerald-200" />{' '}
            Celda disponible
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm bg-indigo-50 border border-indigo-200" />{' '}
            Clase del profesor seleccionado
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm bg-white border border-gray-200" />{' '}
            Celda con conflicto
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlexibleSchedulePanel;
