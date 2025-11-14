import { useState } from "react";
import { crearMatricula, generarMatriculaId } from "../services/matricula.service";
import type {
  DatosAcudiente,
  DatosEstudiante,
  GradoAspirado,
  Matricula,
  TipoIdentificacion
} from "../types/matricula";

export type Errores = Record<string, string>;

const emptyAcudiente = (): DatosAcudiente => ({
  nombreCompleto: "", fechaNacimiento: "", empresa: "", ciudad: "",
  cargoActual: "", email: "", celular: "", cedula: ""
});

const emptyEstudiante = (): DatosEstudiante => ({
  primerApellido:"", segundoApellido:"", nombres:"",
  tipoIdentificacion: 'registro_civil',
  numeroIdentificacion:"",
  fechaNacimiento:"", edadAnos:"", lugarNacimiento:"",
  direccion:"", telefono:"", colegioAnterior:""
});

export function useMatriculaForm() {
  const [paso, setPaso] = useState(1);         // 1…5
  const [enviando, setEnviando] = useState(false);
  const [errores, setErrores] = useState<Errores>({});

  const [form, setForm] = useState<Matricula>({
    id: generarMatriculaId(),
    creadoEn: Date.now(),
    actualizadoEn: Date.now(),
    grado: 'walkers',
    estudiante: emptyEstudiante(),
    madre: emptyAcudiente(),
    padre: emptyAcudiente(),
    responsableCostos: "",
    compromisoPagoPrimerosDiezDias: 'si',
    aceptaTerminos: false,
  });

  function setCampo(path: string, value: any) {
    setForm(prev => {
      const parts = path.split('.');
      // structuredClone asegura copia profunda sin mutar estado
      const clone: any = structuredClone(prev);
      let node: any = clone;
      for (let i=0;i<parts.length-1;i++){
        node[parts[i]] = {...node[parts[i]]};
        node = node[parts[i]];
      }
      node[parts.at(-1)!] = value;
      return clone;
    });
  }

  // Validaciones básicas
  const reEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const reTel   = /^[0-9+\s()-]{7,}$/;
  const isDate  = (v:string) => /^\d{4}-\d{2}-\d{2}$/.test(v);
  const isInt   = (v:string) => /^\d+$/.test(v);

  function get(path:string): string {
    const parts = path.split('.'); let n:any = form;
    for (const p of parts) n = n[p];
    return String(n ?? '');
  }

  // Validación específica del documento del estudiante
  function validarDocumentoEstudiante(): {ok:boolean; msg?:string} {
    const tipo = form.estudiante.tipoIdentificacion;
    const num  = (form.estudiante.numeroIdentificacion || "").trim();
    const soloDigitos = /^\d+$/;
    if (!soloDigitos.test(num)) {
      return { ok:false, msg:"Solo números, sin puntos ni guiones." };
    }
    const len = num.length;
    // Rangos conservadores:
    // Registro civil: 6–15 dígitos | Tarjeta de identidad: 8–12 dígitos
    if (tipo === 'registro_civil') {
      return { ok: len>=6 && len<=15, msg:"Debe tener entre 6 y 15 dígitos." };
    }
    // tarjeta_identidad
    return { ok: len>=8 && len<=12, msg:"Debe tener entre 8 y 12 dígitos." };
  }

  function validar(grupo: string[]): Errores {
    const e:Errores = {};
    const V = (id:string, ok:boolean, msg:string) => { if(!ok) e[id]=msg; };

    for (const id of grupo) {
      const raw = get(id);
      const v = typeof raw === 'string' ? raw.trim() : String(raw ?? '');
      V(id, v !== '', "Este campo es obligatorio.");
      if (id.endsWith('email')) V(id, reEmail.test(v), "Ingresa un email válido.");
      if (id.endsWith('celular') || id.endsWith('telefono')) V(id, reTel.test(v), "Ingresa un teléfono válido.");
      if (id.endsWith('fechaNacimiento')) V(id, isDate(v), "Selecciona una fecha válida (aaaa-mm-dd).");
      if (id.endsWith('edadAnos')) V(id, isInt(v), "Usa un número entero.");
      if (id === 'estudiante.tipoIdentificacion')
        V(id, (['registro_civil','tarjeta_identidad'] as TipoIdentificacion[]).includes(v as any), "Selecciona un tipo válido.");
    }

    const vd = validarDocumentoEstudiante();
    if (!vd.ok) e['estudiante.numeroIdentificacion'] = `Número de identificación inválido. ${vd.msg}`;

    setErrores(e);
    return e;
  }

  function validarPaso(n: number) {
    const grupos = [CAMPOS_1, CAMPOS_2, CAMPOS_3, CAMPOS_4];
    return validar(grupos[n-1] ?? []);
  }

  function validarTodo() {
    const e = validar(CAMPOS_1.concat(CAMPOS_2, CAMPOS_3, CAMPOS_4));
    if (!form.aceptaTerminos) e['aceptaTerminos'] = "Debes aceptar los Términos y condiciones.";
    setErrores(e);
    return e;
  }

  function siguiente() {
    const e = validarPaso(paso);
    if (Object.keys(e).length === 0) setPaso(p => Math.min(5, p+1));
    return Object.keys(e).length === 0;
  }
  function anterior(){ setPaso(p => Math.max(1, p-1)); }

  async function enviar() {
    const e = validarTodo();
    if (Object.keys(e).length) return { ok:false, id:null as string|null };
    setEnviando(true);
    try {
      //@ts-ignore
      const id = await crearMatricula({ ...form, actualizadoEn: Date.now() });
      return { ok:true, id };
    } finally {
      setEnviando(false);
    }
  }

  function reiniciarParaOtro() {
    setErrores({});
    setPaso(1);
    setForm({
      ...form,
      id: generarMatriculaId(),
      creadoEn: Date.now(),
      actualizadoEn: Date.now(),
      estudiante: emptyEstudiante(),
      responsableCostos: "",
      compromisoPagoPrimerosDiezDias: 'si',
      aceptaTerminos: false
    });
  }

  return { form, setCampo, errores, enviando, enviar, paso, siguiente, anterior, setPaso, reiniciarParaOtro };
}

/* Campos obligatorios por paso */
const CAMPOS_1 = [
  'grado',
  'estudiante.primerApellido','estudiante.segundoApellido','estudiante.nombres',
  'estudiante.tipoIdentificacion','estudiante.numeroIdentificacion',
  'estudiante.fechaNacimiento','estudiante.edadAnos','estudiante.lugarNacimiento',
  'estudiante.direccion','estudiante.telefono','estudiante.colegioAnterior'
];
const CAMPOS_2 = [
  'madre.nombreCompleto','madre.fechaNacimiento','madre.empresa','madre.ciudad',
  'madre.cargoActual','madre.email','madre.celular','madre.cedula'
];
const CAMPOS_3 = [
  'padre.nombreCompleto','padre.fechaNacimiento','padre.empresa','padre.ciudad',
  'padre.cargoActual','padre.email','padre.celular','padre.cedula'
];
const CAMPOS_4 = [
  'responsableCostos','compromisoPagoPrimerosDiezDias'
];
