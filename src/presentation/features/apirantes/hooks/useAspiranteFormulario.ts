import { useState } from "react";
import { Aspirante, DatosPadreOMadre } from "../types/aspirantes";
import { crearAspirante } from "../services/aspirantes.service";

function generarId(){
  const r = Math.random().toString(36).slice(2,8);
  return `asp_${Date.now()}_${r}`;
}
function generarGrupoId(){
  const r = Math.random().toString(36).slice(2,6);
  return `grp_${Date.now()}_${r}`;
}

export type Errores = Record<string, string>;
export type EnviarResultado =
  | { ok: true; id: string }
  | { ok: false; id: null; firstError?: string; step?: number };

const emptyParent = (): DatosPadreOMadre => ({
  nombresApellidos:"", numeroIdentificacion:"", direccion:"", barrio:"",
  telefono:"", email:"", empresa:"", profesion:""
});

export function useAspiranteFormulario(){
  const [enviando, setEnviando] = useState(false);
  const [errores, setErrores] = useState<Errores>({});
  const [paso, setPaso] = useState<number>(1); // 1..5
  const [grupoId, setGrupoId] = useState<string | null>(null); // agrupa hermanos

  // Estado inicial: grupoFamiliarId opcional (undefined)
  const [formulario, setFormulario] = useState<Aspirante>({
    id: generarId(), creadoEn: Date.now(), actualizadoEn: Date.now(), estado: "enviado",
    // Aspirante
    nombres:"", apellidos:"", fechaNacimiento:"", lugarNacimiento:"", sexo:"M",
    edadAnios:"", edadMeses:"", direccionResidencia:"", barrioAspirante:"", telefonoCasa:"",
    religion:"", colegioProcedencia:"", ultimoGrado:"",
    // Padres
    padre: emptyParent(),
    madre: emptyParent(),
    // Recomendador
    recomendador:{ nombresApellidos:"", telefono:"", parentesco:"" },
    // Anexar
    familiaresEnColegio:"",
    // Términos
    aceptaTerminos:false
  });

  function actualizarCampo(ruta:string, valor:any){
    setFormulario(prev=>{
      const parts=ruta.split('.'); const copy:any={...prev}; let node:any=copy;
      for(let i=0;i<parts.length-1;i++){ node[parts[i]]={...node[parts[i]]}; node=node[parts[i]]; }
      node[parts[parts.length - 1]]=valor; return copy;
    });
  }

  const reEmail=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const reTel=/^[0-9+\s()-]{7,}$/;
  const isInt=(v:string)=>/^\d+$/.test(v);

  function get(fpath:string):string{
    const parts=fpath.split('.'); let node:any=formulario;
    for(const p of parts){ node=node[p]; }
    return String(node ?? '');
  }

  function validarPorCampos(campos:string[]):Errores{
    const e:Errores={};
    const V=(id:string, ok:boolean, msg:string)=>{ if(!ok) e[id]=msg; };

    for(const id of campos){
      const raw = get(id);
      const v = typeof raw === 'string' ? raw.trim() : String(raw ?? '');
      V(id, v!=='', "Este campo es obligatorio.");
      if(id.endsWith("email")) V(id, reEmail.test(v), "Ingresa un email válido.");
      if(id.endsWith("telefono") || id==="telefonoCasa") V(id, reTel.test(v), "Ingresa un teléfono válido.");
      if(id==="edadAnios") V(id, isInt(v), "Usa un número entero.");
      if(id==="edadMeses") V(id, isInt(v) && Number(v)>=0 && Number(v)<=11, "Número entre 0 y 11.");
      if(id==="sexo") V(id, v==="M" || v==="F", "Selecciona una opción.");
    }
    setErrores(e);
    return e;
  }

  function validarTodo(){
    //@ts-ignore
    const e = validarPorCampos(CAMPOS_PASO_1.concat(CAMPOS_PASO_2, CAMPOS_PASO_3, CAMPOS_PASO_4));
    if (!formulario.aceptaTerminos) e["aceptaTerminos"] = "Debes aceptar los Términos y condiciones para continuar.";
    setErrores(e);
    return e;
  }

  function stepOfField(field:string){
    if (CAMPOS_PASO_1.includes(field)) return 1;
    if (CAMPOS_PASO_2.includes(field)) return 2;
    if (CAMPOS_PASO_3.includes(field)) return 3;
    //@ts-ignore
    if (CAMPOS_PASO_4.includes(field)) return 4;
    if (field === "aceptaTerminos") return 5;
    return 1;
  }

  function firstErrorField(e:Errores){
    //@ts-ignore
    const order=[...CAMPOS_PASO_1, ...CAMPOS_PASO_2, ...CAMPOS_PASO_3, ...CAMPOS_PASO_4, "aceptaTerminos"];
    return order.find(k => e[k]);
  }

  async function enviar(): Promise<EnviarResultado>{
    const e = validarTodo();
    if(Object.keys(e).length){
      const fe = firstErrorField(e);
      return { ok:false, id:null, firstError: fe, step: fe ? stepOfField(fe) : 1 };
    }
    try{
      setEnviando(true);
      // asigna/recicla grupo familiar
      const currentGroup = grupoId ?? (formulario as any).grupoFamiliarId ?? generarGrupoId();
      const id=await crearAspirante({
        ...formulario,
        grupoFamiliarId: currentGroup,
        actualizadoEn: Date.now()
      });
      if(!grupoId) setGrupoId(currentGroup);
      return {ok:true,id};
    } finally { setEnviando(false); }
  }

  function siguiente(){
    //@ts-ignore
    const groups=[CAMPOS_PASO_1,CAMPOS_PASO_2,CAMPOS_PASO_3,CAMPOS_PASO_4];
    const e=validarPorCampos(groups[paso-1] ?? []);
    if(Object.keys(e).length===0) setPaso(prev=>Math.min(prev+1,5));
    return Object.keys(e).length===0;
  }
  function anterior(){ setPaso(prev=>Math.max(prev-1,1)); }

  /** Reinicia SOLO datos del aspirante (para un hermanito).
   *  Conserva: padre, madre, recomendador. Mantiene grupoFamiliarId.
   *  Limpia: datos del niño, anexos, términos. Genera nuevo id.
   */
  function reiniciarParaHermano(){
    const currentGroup = grupoId ?? (formulario as any).grupoFamiliarId ?? generarGrupoId();
    setErrores({});
    setPaso(1);
    setFormulario({
      id: generarId(),
      creadoEn: Date.now(),
      actualizadoEn: Date.now(),
      estado: "enviado",
      // Aspirante (limpios)
      nombres:"", apellidos:"", fechaNacimiento:"", lugarNacimiento:"", sexo:"M",
      edadAnios:"", edadMeses:"", direccionResidencia:"", barrioAspirante:"", telefonoCasa:"",
      religion:"", colegioProcedencia:"", ultimoGrado:"",
      // Conservamos padres y recomendador
      padre: { ...formulario.padre },
      madre: { ...formulario.madre },
      recomendador: { ...formulario.recomendador },
      // Anexo limpio
      familiaresEnColegio:"",
      aceptaTerminos:false,
      // mismo grupo
      grupoFamiliarId: currentGroup
    } as Aspirante);
    setGrupoId(currentGroup);
  }

  return { formulario, actualizarCampo, errores, enviando, enviar, paso, siguiente, anterior, setPaso, reiniciarParaHermano };
}

/* Campos por paso */
const CAMPOS_PASO_1 = [
  "nombres","apellidos","fechaNacimiento","lugarNacimiento","sexo",
  "edadAnios","edadMeses","direccionResidencia","barrioAspirante",
  "telefonoCasa","religion","colegioProcedencia","ultimoGrado"
];
const CAMPOS_PASO_2 = [
  "padre.nombresApellidos","padre.numeroIdentificacion","padre.direccion",
  "padre.barrio","padre.telefono","padre.email","padre.empresa","padre.profesion"
];
const CAMPOS_PASO_3 = [
  "madre.nombresApellidos","madre.numeroIdentificacion","madre.direccion",
  "madre.barrio","madre.telefono","madre.email","madre.empresa","madre.profesion"
];
//@ts-ignore
const CAMPOS_PASO_4 = [
  
];
