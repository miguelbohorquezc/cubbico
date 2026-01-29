import React from 'react';
import { PromotionSummary as PromotionSummaryType } from '../../../../shared/types/studentManagementTypes';

/**
 * Props for PromotionSummary component
 */
export interface PromotionSummaryProps {
  /** Summary data */
  summary: PromotionSummaryType;
  /** Source classroom name */
  sourceClassName: string;
  /** Destination classroom name */
  destinationClassName: string;
  /** Validation issues to display as warnings */
  validationIssues?: string[];
  /** Whether promotion is being executed */
  isExecuting?: boolean;
}

/**
 * Stat card for displaying a single metric
 */
interface StatCardProps {
  label: string;
  value: number;
  color: 'green' | 'yellow' | 'red' | 'blue' | 'slate' | 'amber';
  icon?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, color, icon }) => {
  const colorClasses = {
    green: 'bg-green-50 border-green-200 text-green-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    slate: 'bg-slate-50 border-slate-200 text-slate-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
  };

  const numberColors = {
    green: 'text-green-800',
    yellow: 'text-yellow-800',
    red: 'text-red-800',
    blue: 'text-blue-800',
    slate: 'text-slate-800',
    amber: 'text-amber-800',
  };

  return (
    <div className={`flex items-center gap-2 p-2 rounded-lg border ${colorClasses[color]}`}>
      {icon && <div className="flex-shrink-0 opacity-70">{icon}</div>}
      <div className="min-w-0">
        <p className="text-[10px] font-medium opacity-70 truncate">{label}</p>
        <p className={`text-lg font-bold leading-tight ${numberColors[color]}`}>{value}</p>
      </div>
    </div>
  );
};

/**
 * PromotionSummary
 *
 * Displays a summary of the promotion operation including counts
 * by status, evaluation mode, and any validation warnings.
 *
 * @example
 * ```tsx
 * <PromotionSummary
 *   summary={promotionSummary}
 *   sourceClassName="Primero"
 *   destinationClassName="Segundo"
 *   validationIssues={issues}
 * />
 * ```
 */
const PromotionSummary: React.FC<PromotionSummaryProps> = ({
  summary,
  sourceClassName,
  destinationClassName,
  validationIssues = [],
  isExecuting = false,
}) => {
  const hasWarnings = validationIssues.length > 0;

  return (
    <div className="space-y-3">
      {/* Classroom Transfer Info */}
      <div className="p-3 bg-light-gray-50 rounded-lg border border-light-gray-200">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-light-gray-500 uppercase tracking-wide">Origen</p>
            <p className="text-sm font-semibold text-deep-blue-800 truncate">
              {sourceClassName}
            </p>
          </div>

          <svg className="w-5 h-5 text-light-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>

          <div className="flex-1 min-w-0 text-right">
            <p className="text-[10px] text-light-gray-500 uppercase tracking-wide">Destino</p>
            <p className={`text-sm font-semibold truncate ${destinationClassName ? 'text-green-700' : 'text-amber-600'}`}>
              {destinationClassName || 'Sin seleccionar'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid - adjusted for sidebar */}
      <div className="grid grid-cols-2 gap-2">
        {/* Total */}
        <StatCard
          label="Total"
          value={summary.totalStudents}
          color="slate"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />

        {/* To Promote */}
        <StatCard
          label="Promover"
          value={summary.toPromote}
          color="green"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          }
        />

        {/* To Retain */}
        <StatCard
          label="No promover"
          value={summary.toRetain}
          color="yellow"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        {/* Withdrawn */}
        <StatCard
          label="Retirados"
          value={summary.withdrawn}
          color="red"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          }
        />

        {/* Normal Evaluation */}
        <StatCard
          label="Normal"
          value={summary.normalEvaluation}
          color="slate"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        {/* Adjusted Evaluation */}
        <StatCard
          label="Con Ajustes"
          value={summary.adjustedEvaluation}
          color="amber"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          }
        />
      </div>

      {/* New Students Info */}
      {summary.newStudents > 0 && (
        <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-700">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          <span className="text-xs">
            <span className="font-semibold">{summary.newStudents}</span> nuevo(s)
          </span>
        </div>
      )}

      {/* Validation Warnings */}
      {hasWarnings && (
        <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="min-w-0">
              <p className="text-xs font-medium text-amber-800">Advertencias</p>
              <ul className="mt-1 text-xs text-amber-700 space-y-0.5">
                {validationIssues.map((issue, index) => (
                  <li key={index} className="flex items-start gap-1">
                    <span className="text-amber-400">•</span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Executing indicator */}
      {isExecuting && (
        <div className="flex items-center justify-center gap-2 p-2 bg-medium-blue-50 border border-medium-blue-200 rounded-lg text-medium-blue-700">
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-xs font-medium">Ejecutando...</span>
        </div>
      )}
    </div>
  );
};

export default PromotionSummary;
