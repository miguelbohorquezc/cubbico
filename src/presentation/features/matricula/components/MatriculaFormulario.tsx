import React, { useState } from "react";
import { useMatriculaForm } from "../hooks/useMatriculaForm";
import type { GradoAspirado, Matricula, TipoIdentificacion } from "../types/matricula";
import "../styles/matricula.css";
import { findApplicantByNameInsensitive, findStudentById } from "../services/prefill.service";
import Modal from "../../../components/modal/Modal";

type Props = { isEnabled?: boolean; onGuardado?: (id:string)=>void; };

const GRADOS: {v:GradoAspirado, t:string}[] = [
  {v:'walkers',t:'Walkers'},{v:'nursery',t:'Nursery'},{v:'prekinder',t:'Prekinder'},
  {v:'kinder',t:'Kinder'},{v:'transition',t:'Transition'},
  {v:'primero',t:'Primero'},{v:'segundo',t:'Segundo'},{v:'tercero',t:'Tercero'},
  {v:'cuarto',t:'Cuarto'},{v:'quinto',t:'Quinto'},{v:'sexto',t:'Sexto'},{v:'septimo',t:'Séptimo'},
];

const ID_LABEL: Record<TipoIdentificacion, string> = {
  registro_civil: "Registro civil",
  tarjeta_identidad: "Tarjeta de identidad",
};

function mapTipoFromStudent(docType: string, fallback: TipoIdentificacion): TipoIdentificacion {
  const t = (docType || "").toUpperCase();
  if (t === "RC") return "registro_civil";
  if (t === "TI") return "tarjeta_identidad";
  return fallback;
}

export default function MatriculaFormulario({ isEnabled=true, onGuardado }:Props){
  const { form, setCampo, errores, enviando, enviar, validarDuplicado, paso, siguiente, anterior, setPaso, reiniciarParaOtro } = useMatriculaForm();
  const [enviado, setEnviado] = useState(false);
  const [folio, setFolio] = useState<string | null>(null);
  const [modalConfirmAbierto, setModalConfirmAbierto] = useState(false);
  const [errorDuplicado, setErrorDuplicado] = useState<string | null>(null);

  // Paso 0: precarga
  const [prefDone, setPrefDone] = useState(false);
  const [prefTipo, setPrefTipo] = useState<TipoIdentificacion>("registro_civil");
  const [prefNumero, setPrefNumero] = useState("");
  const [prefLoading, setPrefLoading] = useState(false);
  const [prefNom, setPrefNom] = useState("");
  const [prefApe, setPrefApe] = useState("");

  // Alerta visual
  const [alerta, setAlerta] = useState<{type:'info'|'success'|'error'; msg:string} | null>(null);
  const showAlert = (type:'info'|'success'|'error', msg:string) => {
    setAlerta({type, msg});
    // auto ocultar
    setTimeout(()=>setAlerta(a => (a?.msg===msg ? null : a)), 4500);
  };

  //@ts-ignore
  const progreso = ((paso - 1) / 4) * 100;

  if(!isEnabled){
    return (
      <div className="screen">
        <div className="screen__center matricula">
          <div className="container">
            <section className="disabled-card" aria-live="polite">
              <h2>Formulario temporalmente inactivo</h2>
              <p>La matrícula se habilitará pronto. Secretaría informará los pasos.</p>
            </section>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- UI de precarga ---------- */
  if(!prefDone){
    return (
      <div className="screen">
        <div className="screen__center matricula">
          <div className="container">
            <section className="panel" role="form" aria-labelledby="pre-titulo">
              <legend id="pre-titulo">Verificación inicial</legend>
              <p className="muted">
                Primero intentaremos precargar datos automáticamente. Puedes:
                <br/>
                1) Buscar <b>estudiante antiguo por identificación</b>, o <br/>
                2) Buscar <b>aspirante</b> por nombres y apellidos.
              </p>

              {alerta && (
                <div className={`alert alert--${alerta.type}`} role="alert" aria-live="assertive">
                  <span>{alerta.msg}</span>
                  <button className="alert__close" onClick={()=>setAlerta(null)} aria-label="Cerrar">×</button>
                </div>
              )}

              <div className="grid grid--2" style={{marginTop:'.75rem'}}>
                {/* Bloque: estudiante antiguo por identificación */}
                <div className="panel">
                  <legend>Estudiante antiguo por identificación</legend>
                  <div className="grid grid--2">
                    <Select
                      id="pre-tipo"
                      label="Tipo de identificación"
                      value={prefTipo}
                      onChange={(_,v)=>setPrefTipo(v as TipoIdentificacion)}
                      options={[
                        { v:'registro_civil', t:'Registro civil' },
                        { v:'tarjeta_identidad', t:'Tarjeta de identidad' },
                      ]}
                    />
                    <Campo
                      id="pre-num"
                      label="Número de identificación del estudiante"
                      value={prefNumero}
                      onChange={(_,v)=>setPrefNumero(v.replace(/\D/g,''))}
                    />
                  </div>
                  <div className="actions">
                    <button
                      className="btn btn--primary"
                      disabled={prefLoading}
                      onClick={async ()=>{
                        const num = prefNumero.trim();
                        if (!/^\d+$/.test(num)) { showAlert('error', 'Solo números, sin puntos ni guiones.'); return; }
                        if (prefTipo==='registro_civil' && !(num.length>=6 && num.length<=15)) {
                          showAlert('error','El Registro civil debe tener entre 6 y 15 dígitos.'); return;
                        }
                        if (prefTipo==='tarjeta_identidad' && !(num.length>=8 && num.length<=12)) {
                          showAlert('error','La Tarjeta de identidad debe tener entre 8 y 12 dígitos.'); return;
                        }

                        setPrefLoading(true);
                        try{
                          const stu = await findStudentById(num);
                          if (stu) {
                            const last = String(stu.lastName || "").trim();
                            const partes = last.split(/\s+/);
                            const primerApellido = partes[0] ?? "";
                            const segundoApellido = partes.slice(1).join(" ");
                            setCampo("estudiante.primerApellido", primerApellido);
                            setCampo("estudiante.segundoApellido", segundoApellido);
                            setCampo("estudiante.nombres", String(stu.name || ""));
                            setCampo("estudiante.numeroIdentificacion", num);
                            setCampo("estudiante.tipoIdentificacion", mapTipoFromStudent(String(stu.document || ""), prefTipo));
                            showAlert('success','Se cargaron datos del estudiante. Continúa con la matrícula.');
                            setPrefDone(true); setPaso(1); window.scrollTo({top:0,behavior:"smooth"});
                            return;
                          }
                          showAlert('info','No encontramos ese documento en estudiantes. Prueba buscar en aspirantes por nombre y apellidos.');
                        } finally {
                          setPrefLoading(false);
                        }
                      }}
                    >
                      {prefLoading ? "Buscando…" : "Buscar y continuar"}
                    </button>
                  </div>
                </div>

                {/* Bloque: aspirante por nombre y apellidos */}
                <div className="panel">
                  <legend>Aspirante por nombres y apellidos</legend>
                  <div className="grid grid--2">
                    <Campo id="pre-nom" label="Nombres" value={prefNom} onChange={(_,v)=>setPrefNom(v)} />
                    <Campo id="pre-ape" label="Apellidos" value={prefApe} onChange={(_,v)=>setPrefApe(v)} />
                  </div>
                  <div className="actions">
                    <button
                      className="btn"
                      disabled={prefLoading}
                      onClick={async ()=>{
                        if (!prefNom.trim() || !prefApe.trim()) {
                          showAlert('error','Digita nombres y apellidos para buscar en aspirantes.');
                          return;
                        }
                        setPrefLoading(true);
                        try{
                          const app = await findApplicantByNameInsensitive(prefNom.trim(), prefApe.trim());
                          if (!app) { showAlert('info','No se encontraron coincidencias en aspirantes.'); return; }

                          const apellidos = String(app.apellidos || "").trim().split(/\s+/);
                          setCampo("estudiante.primerApellido", apellidos[0] ?? "");
                          setCampo("estudiante.segundoApellido", apellidos.slice(1).join(" "));
                          setCampo("estudiante.nombres", String(app.nombres || ""));
                          setCampo("estudiante.fechaNacimiento", String(app.fechaNacimiento || ""));
                          setCampo("estudiante.lugarNacimiento", String(app.lugarNacimiento || ""));
                          setCampo("estudiante.direccion", String(app.direccionResidencia || ""));
                          setCampo("estudiante.telefono", String(app.telefonoCasa || ""));
                          setCampo("estudiante.colegioAnterior", String(app.colegioProcedencia || ""));
                          if (prefNumero) setCampo("estudiante.numeroIdentificacion", prefNumero);
                          setCampo("estudiante.tipoIdentificacion", prefTipo);

                          if (app.padre) {
                            setCampo("padre.nombreCompleto", String(app.padre.nombresApellidos || ""));
                            setCampo("padre.empresa", String(app.padre.empresa || ""));
                            setCampo("padre.cargoActual", String(app.padre.profesion || ""));
                            setCampo("padre.ciudad", String(app.padre.barrio || ""));
                            setCampo("padre.email", String(app.padre.email || ""));
                            setCampo("padre.celular", String(app.padre.telefono || ""));
                            setCampo("padre.cedula", String(app.padre.numeroIdentificacion || ""));
                          }
                          if (app.madre) {
                            setCampo("madre.nombreCompleto", String(app.madre.nombresApellidos || ""));
                            setCampo("madre.empresa", String(app.madre.empresa || ""));
                            setCampo("madre.cargoActual", String(app.madre.profesion || ""));
                            setCampo("madre.ciudad", String(app.madre.barrio || ""));
                            setCampo("madre.email", String(app.madre.email || ""));
                            setCampo("madre.celular", String(app.madre.telefono || ""));
                            setCampo("madre.cedula", String(app.madre.numeroIdentificacion || ""));
                          }

                          showAlert('success','Se cargaron datos del aspirante. Continúa con la matrícula.');
                          setPrefDone(true); setPaso(1); window.scrollTo({top:0,behavior:"smooth"});
                        } finally {
                          setPrefLoading(false);
                        }
                      }}
                    >
                      {prefLoading ? "Buscando…" : "Buscar en aspirantes"}
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- Tarjeta de éxito ---------- */
  if(enviado){
    return (
      <div className="screen">
        <div className="screen__center matricula">
          <div className="container">
            <section className="success-card" role="status" aria-live="polite">
              <div className="ok-icon" aria-hidden="true"></div>
              <h2>¡Matrícula registrada!</h2>
              <p className="muted">Nos comunicaremos desde secretaría para continuar el proceso.</p>
              {folio && <p><b>Radicado:</b> {folio}</p>}
              <div className="actions" style={{justifyContent:'center'}}>
                <button className="btn btn--primary" onClick={()=>{
                  setEnviado(false); setFolio(null); reiniciarParaOtro(); window.scrollTo({top:0,behavior:'smooth'});
                }}>Registrar otro estudiante</button>
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- Wizard pasos 1..5 (igual que antes) ---------- */
  const progresoStyle = { width: `${((paso - 1) / 4) * 100}%` };

  return (
    <div className="screen">
      <div className="screen__center matricula">
        <div className="container">

          <nav aria-label="Progreso" className="stepper" role="navigation">
            {[1,2,3,4].map(i=>(
              <React.Fragment key={i}>
                <div className={`stepper__dot ${paso===i?'stepper__dot--active':''}`} aria-current={paso===i?'step':'false'}>{i}</div>
                {i<4 && <div className={`stepper__line ${paso>i?'stepper__line--active':''}`}></div>}
              </React.Fragment>
            ))}
          </nav>
          <div className="progress" aria-hidden="true"><div className="progress__bar" style={progresoStyle}/></div>

          {/* PASO 1 */}
          {paso===1 && (
            <fieldset className="panel">
              <legend>Grado al que aspira & Información del estudiante</legend>

              <div className="grado-grid">
                {GRADOS.map(g=>(
                  <label key={g.v} className={`grado ${form.grado===g.v?'grado--active':''}`}>
                    <input type="radio" name="grado" value={g.v}
                      checked={form.grado===g.v}
                      onChange={(e)=>setCampo('grado', e.target.value)}
                    />
                    <span>{g.t}</span>
                  </label>
                ))}
              </div>
              {errores['grado'] && <div className="error">{errores['grado']}</div>}

              <div className="grid grid--3" style={{marginTop:'1rem'}}>
                <Campo id="estudiante.primerApellido" label="Primer apellido" value={form.estudiante.primerApellido} onChange={setCampo} error={errores['estudiante.primerApellido']}/>
                <Campo id="estudiante.segundoApellido" label="Segundo apellido" value={form.estudiante.segundoApellido} onChange={setCampo} error={errores['estudiante.segundoApellido']}/>
                <Campo id="estudiante.nombres" label="Nombre(s)" value={form.estudiante.nombres} onChange={setCampo} error={errores['estudiante.nombres']}/>

                <Select
                  id="estudiante.tipoIdentificacion"
                  label="Tipo de identificación"
                  value={form.estudiante.tipoIdentificacion}
                  onChange={setCampo}
                  error={errores['estudiante.tipoIdentificacion']}
                  options={[
                    { v: 'registro_civil', t: 'Registro civil' },
                    { v: 'tarjeta_identidad', t: 'Tarjeta de identidad' }
                  ]}
                />
                <Campo
                  id="estudiante.numeroIdentificacion"
                  label="Número de identificación del estudiante"
                  value={form.estudiante.numeroIdentificacion}
                  onChange={setCampo}
                  error={errores['estudiante.numeroIdentificacion']}
                />

                <Campo id="estudiante.fechaNacimiento" type="date" label="Fecha de nacimiento" value={form.estudiante.fechaNacimiento} onChange={setCampo} error={errores['estudiante.fechaNacimiento']}/>
                <Campo id="estudiante.edadAnos" type="number" label="Edad (años)" value={form.estudiante.edadAnos} onChange={setCampo} error={errores['estudiante.edadAnos']}/>
                <Campo id="estudiante.lugarNacimiento" label="Lugar de nacimiento" value={form.estudiante.lugarNacimiento} onChange={setCampo} error={errores['estudiante.lugarNacimiento']}/>
                <Campo id="estudiante.direccion" label="Dirección" value={form.estudiante.direccion} onChange={setCampo} error={errores['estudiante.direccion']}/>
                <Campo id="estudiante.telefono" label="Teléfono" value={form.estudiante.telefono} onChange={setCampo} error={errores['estudiante.telefono']}/>
                <Campo id="estudiante.colegioAnterior" label="Jardín o colegio anterior" value={form.estudiante.colegioAnterior} onChange={setCampo} error={errores['estudiante.colegioAnterior']}/>
              </div>

              <div className="actions">
                <button className="btn btn--primary" type="button" onClick={()=>siguiente() && window.scrollTo({top:0,behavior:'smooth'})}>Siguiente</button>
              </div>
            </fieldset>
          )}

          {/* PASO 2 */}
          {paso===2 && (
            <AcudientePanel
              titulo="Información de la mamá"
              base="madre"
              valores={form.madre}
              errores={errores}
              onChange={setCampo}
              onPrev={anterior}
              onNext={()=>siguiente() && window.scrollTo({top:0,behavior:'smooth'})}
            />
          )}

          {/* PASO 3 */}
          {paso===3 && (
            <AcudientePanel
              titulo="Información del papá"
              base="padre"
              valores={form.padre}
              errores={errores}
              onChange={setCampo}
              onPrev={anterior}
              onNext={()=>siguiente() && window.scrollTo({top:0,behavior:'smooth'})}
            />
          )}

          {/* PASO 4 */}
          {paso===4 && (
            <fieldset className="panel">
              <legend>Responsable económico y compromiso</legend>

              <div className="grid grid--2">
                <Campo id="responsableCostos" label="¿Quién asume los costos educativos?" value={form.responsableCostos} onChange={setCampo} error={errores['responsableCostos']}/>
                <div>
                  <label className="label">¿Se compromete a cancelar los diez (10) primeros días de cada mes?</label>
                  <div className="radio-row">
                    <label className={`radio ${form.compromisoPagoPrimerosDiezDias==='si'?'radio--active':''}`}>
                      <input type="radio" name="compromiso" value="si"
                        checked={form.compromisoPagoPrimerosDiezDias==='si'}
                        onChange={()=>setCampo('compromisoPagoPrimerosDiezDias','si')}
                      />
                      <span>Sí</span>
                    </label>
                    <label className={`radio ${form.compromisoPagoPrimerosDiezDias==='no'?'radio--active':''}`}>
                      <input type="radio" name="compromiso" value="no"
                        checked={form.compromisoPagoPrimerosDiezDias==='no'}
                        onChange={()=>setCampo('compromisoPagoPrimerosDiezDias','no')}
                      />
                      <span>No</span>
                    </label>
                  </div>
                  {errores['compromisoPagoPrimerosDiezDias'] && <div className="error">{errores['compromisoPagoPrimerosDiezDias']}</div>}
                </div>
              </div>

              <div style={{marginTop:'1rem'}}>
                <label className="label" htmlFor="aceptaTerminos">Términos y condiciones</label>
                <div style={{display:'flex',alignItems:'center',gap:'.5rem'}}>
                  <input
                    id="aceptaTerminos"
                    type="checkbox"
                    checked={!!form.aceptaTerminos}
                    onChange={(e)=>setCampo('aceptaTerminos', e.target.checked)}
                    className="checkbox"
                    aria-invalid={!!errores['aceptaTerminos']}
                    aria-describedby={errores['aceptaTerminos'] ? 'aceptaTerminos-err' : undefined}
                  />
                  <span>He leído y acepto los <a href="/terminos-y-condiciones" target="_blank" className="link">Términos y condiciones</a>.</span>
                </div>
                {errores['aceptaTerminos'] && <div id="aceptaTerminos-err" className="error">{errores['aceptaTerminos']}</div>}
              </div>

              <div className="actions">
                <button className="btn" type="button" onClick={()=>anterior()}>Atrás</button>
                <button className="btn" type="button" onClick={()=>setPaso(5)}>Revisar y enviar</button>
              </div>
            </fieldset>
          )}

          {/* PASO 5 */}
          {paso===5 && (
            <fieldset className="panel">
              <legend>Resumen</legend>
              <Resumen data={form}/>
              <div className="actions">
                <button className="btn" onClick={()=>setPaso(1)}>Editar</button>
                <button
                  className="btn btn--primary"
                  onClick={()=>{
                    setErrorDuplicado(null);
                    setModalConfirmAbierto(true);
                  }}
                >
                  Confirmar y enviar
                </button>
              </div>
            </fieldset>
          )}

        </div>
      </div>

      {/* Modal de confirmación */}
      <ConfirmacionMatriculaModal
        open={modalConfirmAbierto}
        onClose={() => setModalConfirmAbierto(false)}
        data={form}
        enviando={enviando}
        errorDuplicado={errorDuplicado}
        onConfirmar={async () => {
          // Primero validar duplicado
          const validacion = await validarDuplicado();
          if (!validacion.ok) {
            setErrorDuplicado(validacion.msg || "Error de validación");
            return;
          }

          // Si pasa la validación, enviar
          const r = await enviar();

          if (!r.ok) {
            if (!form.aceptaTerminos) {
              setModalConfirmAbierto(false);
              setPaso(4);
              setTimeout(() => {
                document.getElementById('aceptaTerminos')?.scrollIntoView({behavior:'smooth', block:'center'});
                (document.getElementById('aceptaTerminos') as HTMLInputElement | null)?.focus?.();
              }, 0);
            }
            showAlert('error','Revisa los campos: faltan requisitos para enviar.');
            return;
          }

          // Éxito: cerrar modal y mostrar pantalla de éxito
          setModalConfirmAbierto(false);
          setFolio(r.id!);
          setEnviado(true);
          onGuardado?.(r.id!);
        }}
      />
    </div>
  );
}

/* ---------- Subcomponentes ---------- */
function Campo(props:{
  id:string; label:string; value:any; onChange:(p:string,v:string)=>void;
  error?:string; type?:React.HTMLInputTypeAttribute;
}){
  const {id,label,value,onChange,error,type='text'}=props;
  const safeValue = value ?? '';
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      <input
        id={id} className="input" type={type}
        value={String(safeValue)}
        onChange={e=>onChange(id, e.target.value)}
        aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined}
      />
      {error && <div id={`${id}-err`} className="error">{error}</div>}
    </div>
  );
}

function Select(props:{
  id:string; label:string; value:any; onChange:(p:string,v:string)=>void;
  error?:string; options:{v:string,t:string}[];
}){
  const {id,label,value,onChange,error,options}=props;
  const fallback = options[0]?.v ?? '';
  const safeValue = (value ?? fallback);
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      <select
        id={id} className="select" value={safeValue}
        onChange={(e)=>onChange(id, e.target.value)}
        aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined}
      >
        {options.map(o=> <option key={o.v} value={o.v}>{o.t}</option>)}
      </select>
      {error && <div id={`${id}-err`} className="error">{error}</div>}
    </div>
  );
}

function AcudientePanel({titulo, base, valores, errores, onChange, onPrev, onNext}:{
  titulo:string; base:'madre'|'padre'; valores:any; errores:Record<string,string>;
  onChange:(p:string,v:string)=>void; onPrev:()=>void; onNext:()=>void;
}){
  const id=(k:string)=>`${base}.${k}`;
  return (
    <fieldset className="panel">
      <legend>{titulo}</legend>
      <div className="grid grid--3">
        <Campo id={id('nombreCompleto')} label="Nombre completo" value={valores?.nombreCompleto ?? ''} onChange={onChange} error={errores[id('nombreCompleto')]}/>
        <Campo id={id('fechaNacimiento')} type="date" label="Fecha de nacimiento" value={valores?.fechaNacimiento ?? ''} onChange={onChange} error={errores[id('fechaNacimiento')]}/>
        <Campo id={id('empresa')} label="Empresa donde trabaja" value={valores?.empresa ?? ''} onChange={onChange} error={errores[id('empresa')]}/>
        <Campo id={id('ciudad')} label="Ciudad" value={valores?.ciudad ?? ''} onChange={onChange} error={errores[id('ciudad')]}/>
        <Campo id={id('cargoActual')} label="Cargo actual" value={valores?.cargoActual ?? ''} onChange={onChange} error={errores[id('cargoActual')]}/>
        <Campo id={id('email')} label="Email" value={valores?.email ?? ''} onChange={onChange} error={errores[id('email')]}/>
        <Campo id={id('celular')} label="Celular" value={valores?.celular ?? ''} onChange={onChange} error={errores[id('celular')]}/>
        <Campo id={id('cedula')} label="Cédula" value={valores?.cedula ?? ''} onChange={onChange} error={errores[id('cedula')]}/>
      </div>
      <div className="actions">
        <button className="btn" type="button" onClick={onPrev}>Atrás</button>
        <button className="btn btn--primary" type="button" onClick={onNext}>Siguiente</button>
      </div>
    </fieldset>
  );
}

/* Helper para filas de detalle en el modal */
function DetailRow({label, value}: {label: string; value: string | React.ReactNode}) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-100">
      <span className="text-sm font-medium text-gray-600">{label}</span>
      <span className="text-sm text-gray-900">{value}</span>
    </div>
  );
}

/* Modal de confirmación de matrícula */
function ConfirmacionMatriculaModal({
  open,
  onClose,
  data,
  onConfirmar,
  enviando,
  errorDuplicado
}: {
  open: boolean;
  onClose: () => void;
  data: Matricula;
  onConfirmar: () => void;
  enviando: boolean;
  errorDuplicado: string | null;
}) {
  const g = (v: GradoAspirado) => {
    const m = new Map(GRADOS.map(x => [x.v, x.t]));
    return m.get(v) ?? v;
  };

  return (
    <Modal isOpen={open} onClose={onClose} title="Confirmar matrícula" size="2xl">
      <div className="space-y-6">
        {/* Alerta de error de duplicado */}
        {errorDuplicado && (
          <div
            className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg"
            role="alert"
          >
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-red-500 mt-0.5 mr-3"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <h3 className="text-sm font-semibold text-red-800">
                  Error: Documento duplicado
                </h3>
                <p className="text-sm text-red-700 mt-1">{errorDuplicado}</p>
              </div>
            </div>
          </div>
        )}

        {/* Grado con gradiente */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-4 text-white">
          <p className="text-sm font-medium opacity-90">Grado solicitado</p>
          <p className="text-2xl font-bold mt-1">{g(data.grado)}</p>
        </div>

        {/* Datos del estudiante */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-base font-semibold text-gray-900 mb-3">
            Datos del estudiante
          </h3>
          <div className="space-y-1">
            <DetailRow
              label="Nombre completo"
              value={`${data.estudiante.primerApellido} ${data.estudiante.segundoApellido} ${data.estudiante.nombres}`}
            />
            <DetailRow
              label="Identificación"
              value={`${ID_LABEL[data.estudiante.tipoIdentificacion as TipoIdentificacion]} - ${data.estudiante.numeroIdentificacion}`}
            />
            <DetailRow
              label="Fecha de nacimiento"
              value={`${data.estudiante.fechaNacimiento} (${data.estudiante.edadAnos} años)`}
            />
            <DetailRow
              label="Lugar de nacimiento"
              value={data.estudiante.lugarNacimiento}
            />
            <DetailRow
              label="Dirección"
              value={data.estudiante.direccion}
            />
            <DetailRow
              label="Teléfono"
              value={data.estudiante.telefono}
            />
            <DetailRow
              label="Colegio anterior"
              value={data.estudiante.colegioAnterior}
            />
          </div>
        </div>

        {/* Datos de la mamá */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-base font-semibold text-gray-900 mb-3">
            Datos de la mamá
          </h3>
          <div className="space-y-1">
            <DetailRow
              label="Nombre completo"
              value={data.madre.nombreCompleto}
            />
            <DetailRow
              label="Fecha de nacimiento"
              value={data.madre.fechaNacimiento}
            />
            <DetailRow
              label="Empresa"
              value={data.madre.empresa}
            />
            <DetailRow
              label="Cargo actual"
              value={data.madre.cargoActual}
            />
            <DetailRow
              label="Ciudad"
              value={data.madre.ciudad}
            />
            <DetailRow
              label="Email"
              value={data.madre.email}
            />
            <DetailRow
              label="Celular"
              value={data.madre.celular}
            />
            <DetailRow
              label="Cédula"
              value={data.madre.cedula}
            />
          </div>
        </div>

        {/* Datos del papá */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-base font-semibold text-gray-900 mb-3">
            Datos del papá
          </h3>
          <div className="space-y-1">
            <DetailRow
              label="Nombre completo"
              value={data.padre.nombreCompleto}
            />
            <DetailRow
              label="Fecha de nacimiento"
              value={data.padre.fechaNacimiento}
            />
            <DetailRow
              label="Empresa"
              value={data.padre.empresa}
            />
            <DetailRow
              label="Cargo actual"
              value={data.padre.cargoActual}
            />
            <DetailRow
              label="Ciudad"
              value={data.padre.ciudad}
            />
            <DetailRow
              label="Email"
              value={data.padre.email}
            />
            <DetailRow
              label="Celular"
              value={data.padre.celular}
            />
            <DetailRow
              label="Cédula"
              value={data.padre.cedula}
            />
          </div>
        </div>

        {/* Responsable económico */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-base font-semibold text-gray-900 mb-3">
            Responsable económico
          </h3>
          <div className="space-y-1">
            <DetailRow
              label="Responsable de costos"
              value={data.responsableCostos}
            />
            <DetailRow
              label="Compromiso de pago (primeros 10 días)"
              value={data.compromisoPagoPrimerosDiezDias === 'si' ? 'Sí' : 'No'}
            />
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={enviando}
            className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            disabled={enviando}
            className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {enviando && (
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            {enviando ? 'Enviando...' : 'Confirmar y enviar'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function Resumen({data}:{data:Matricula}){
  const g = (v:GradoAspirado)=> {
    const m = new Map(GRADOS.map(x=>[x.v,x.t])); return m.get(v) ?? v;
  };
  return (
    <article className="summary">
      <h4>Grado: <span className="pill">{g(data.grado)}</span></h4>
      <h3>Estudiante</h3>
      <ul>
        <li><b>Nombre:</b> {data.estudiante.primerApellido} {data.estudiante.segundoApellido} {data.estudiante.nombres}</li>
        <li><b>Identificación:</b> {ID_LABEL[data.estudiante.tipoIdentificacion as TipoIdentificacion]} — {data.estudiante.numeroIdentificacion}</li>
        <li><b>Nacimiento:</b> {data.estudiante.fechaNacimiento} — {data.estudiante.lugarNacimiento} — {data.estudiante.edadAnos} años</li>
        <li><b>Dirección y teléfono:</b> {data.estudiante.direccion} — {data.estudiante.telefono}</li>
        <li><b>Colegio anterior:</b> {data.estudiante.colegioAnterior}</li>
      </ul>
      <h3>Mamá</h3>
      <ul>
        <li><b>Nombre:</b> {data.madre.nombreCompleto}</li>
        <li><b>Nacimiento:</b> {data.madre.fechaNacimiento}</li>
        <li><b>Empresa/Cargo:</b> {data.madre.empresa} — {data.madre.cargoActual}</li>
        <li><b>Ciudad:</b> {data.madre.ciudad}</li>
        <li><b>Contacto:</b> {data.madre.celular} — {data.madre.email}</li>
        <li><b>Cédula:</b> {data.madre.cedula}</li>
      </ul>
      <h3>Papá</h3>
      <ul>
        <li><b>Nombre:</b> {data.padre.nombreCompleto}</li>
        <li><b>Nacimiento:</b> {data.padre.fechaNacimiento}</li>
        <li><b>Empresa/Cargo:</b> {data.padre.empresa} — {data.padre.cargoActual}</li>
        <li><b>Ciudad:</b> {data.padre.ciudad}</li>
        <li><b>Contacto:</b> {data.padre.celular} — {data.padre.email}</li>
        <li><b>Cédula:</b> {data.padre.cedula}</li>
      </ul>
      <h3>Responsable y Compromiso</h3>
      <ul>
        <li><b>Responsable costos:</b> {data.responsableCostos}</li>
        <li><b>Compromiso de pago:</b> {data.compromisoPagoPrimerosDiezDias==='si'?'Sí':'No'}</li>
      </ul>
    </article>
  );
}
