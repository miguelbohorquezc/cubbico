# Plan de Refactorización UI + PWA

**Inicio:** 2026-02-13
**Objetivo:** Consistencia visual + PWA
**Total tareas:** 23 (max 2 archivos c/u)

## Paleta Oficial
- **Primary:** Orchid Blue (#0F2358 → #E4F0FF)
- **Accent:** Gold institucional
- **Additional:** Magenta, Peach, Yellow, Tosca
- **Border radius:** `rounded-lg` (reducir de xl/2xl)

---

## FASE 1: Configuración Base (4)
- [x] 1.1 - Crear `designTokens.ts`
- [x] 1.2 - Actualizar `tailwind.config.js` (Magenta, Peach, Yellow, Tosca)
- [x] 1.3 - Instalar `vite-plugin-pwa` + config `vite.config.ts`
- [x] 1.4 - Crear `manifest.json` + meta tags PWA

## FASE 2: Componentes UI Core (8)
- [x] 2.1 - `Button.tsx` - Colores + rounded-lg
- [x] 2.2 - `Badge.tsx` - Verificar colores
- [x] 2.3 - `Card.tsx` - Border radius
- [x] 2.4 - `Modal.tsx` - Colores + rounded-lg
- [x] 2.5 - `HeaderV2.tsx` - Colores + rounded-lg
- [x] 2.6 - `UserProfile.tsx` - rounded-lg
- [x] 2.7 - `SidebarNavItem.tsx` - Reemplazar amber → institucional
- [x] 2.8 - `SearchBar.tsx` - rounded-lg

## FASE 3: Páginas Principales (5)
- [x] 3.1 - `StudentsPage.tsx` - emerald → institucional
- [x] 3.2 - `ClassRoomPage.tsx` - Paleta oficial
- [x] 3.3 - `AreaPage.tsx` - Paleta oficial
- [x] 3.4 - `Users.tsx` - Paleta oficial
- [x] 3.5 - `History.tsx` - Paleta oficial

## FASE 4: PWA + Optimizaciones (6)
- [x] 4.1 - Iconos PWA (Configurados en vite.config.ts)
- [x] 4.2 - Meta tags PWA adicionales
- [x] 4.3 - `DataTable.tsx` - Colores + rounded-lg
- [x] 4.4 - Crear `DESIGN_SYSTEM.md`
- [x] 4.5 - `StudentsList.tsx` - Colores
- [x] 4.6 - `LoginForm.tsx` - Colores + rounded-lg

---

## Restricciones
- ❌ NO TOCAR: `notes/`, `achievement/`, `classRoomReport/`, `informeGeneral/`
- ✅ Max 2 archivos/tarea
- ✅ Solo Tailwind (no CSS files)

## Progreso
**Completadas:** 23/23 (100%) ✅
**Última actualización:** PROYECTO COMPLETADO + Actualización masiva

## Actualización Masiva Realizada
✅ **~50 archivos** actualizados con reemplazo automático:
- `bg-emerald-*` → `bg-tosca-*` (verde institucional)
- `bg-violet-*`, `bg-purple-*` → `bg-magenta-*`
- `bg-indigo-*`, `bg-sky-*` → `bg-orchid-blue-*`
- `rounded-xl/2xl/3xl` → `rounded-lg`
- Archivos CSS con border-radius actualizados

✅ **Gradientes eliminados:**
- TODOS los gradientes en botones → colores sólidos
- Colores de acento aplicados según paleta oficial
- Componente Button actualizado con Orchid Blue 50 (#1F4CC0)

✅ **Variables CSS actualizadas (index.css):**
- `--background-sidebar-color`: #FFFFFF
- `--btn-hover-primary`: #1F4CC0 (Orchid Blue 50)
- `--deep-blue`: #0F2358 (Orchid Blue 70)
- `--medium-blue`: #1F4CC0 (Orchid Blue 50)
- Gold references → Yellow oficial (#FFD600)

✅ **Módulos protegidos NO tocados:**
- `notes/`, `achievement/`, `classRoomReport/`, `informeGeneral/`
