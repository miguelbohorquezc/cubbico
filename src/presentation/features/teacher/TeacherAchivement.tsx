import { useMemo, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../../../app/store/store";
import { useParams } from "react-router-dom";
import { IconTargetArrow, IconAlertCircle } from "@tabler/icons-react";
import { loadTeacherAchievements } from "../../../app/store/states/teacher.slice";

const TeacherAchievements = () => {
  const dispatch = useAppDispatch();
  const { achievements, loading } = useAppSelector((state) => state.teacherData);
  const user = useAppSelector((state) => state.user) as any;
  const { periodId, classroomId, areaId } = useParams();

  // ✅ Cargar achievements automáticamente cuando cambian los parámetros
  useEffect(() => {
    if (user?.uid && classroomId && areaId && periodId) {
      console.log('🔄 Cargando achievements para:', { classroomId, areaId, periodId });
      dispatch(loadTeacherAchievements(user.uid));
    }
  }, [dispatch, user?.uid, classroomId, areaId, periodId]);

  // Filtrar logros por classroomId y areaId
  const filteredAchievements = useMemo(() => {
    console.log('📊 Filtrando achievements:', {
      total: achievements.length,
      buscando: { classroomId, areaId, periodId: Number(periodId) },
      achievements: achievements.map(a => ({
        id: a.id,
        classroomId: a.classroomId,
        areaId: a.areaId,
        period: a.period
      }))
    });

    return achievements.filter(achievement =>
      achievement.classroomId === classroomId &&
      achievement.areaId === areaId &&
      achievement.period === Number(periodId)
    );
  }, [achievements, classroomId, areaId, periodId]);

  // Estado de carga
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  // Sin logros registrados
  if (filteredAchievements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4">
        <div className="w-12 h-12 mb-3 bg-amber-50 rounded-full flex items-center justify-center">
          <IconAlertCircle size={24} className="text-amber-500" />
        </div>
        <p className="text-sm font-medium text-gray-700 mb-1">Sin logros registrados</p>
        <p className="text-xs text-gray-500 text-center">
          Haz clic en "Logros" para crear los logros del período
        </p>
      </div>
    );
  }

  // Mostrar logros
  const achievement = filteredAchievements[0];
  const logros = [
    { num: 1, text: achievement.logros?.logro1 },
    { num: 2, text: achievement.logros?.logro2 },
    { num: 3, text: achievement.logros?.logro3 },
  ];

  return (
    <div className="space-y-3">
      {logros.map((logro) => (
        <div
          key={logro.num}
          className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100/80 transition-colors"
        >
          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <IconTargetArrow size={16} className="text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded bg-blue-100 text-blue-700 mb-1">
              Logro {logro.num}
            </span>
            <p className="text-sm text-gray-700 leading-relaxed">
              {logro.text || <em className="text-gray-400">Sin registrar</em>}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TeacherAchievements;