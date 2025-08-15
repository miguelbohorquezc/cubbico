import React from "react";
import { useAspiranteFormulario } from "../hooks/useAspiranteFormulario";
import { Aspirante } from "../types/aspirantes";
import "../styles/onboarding.css";

type Props = { isEnabled?: boolean; onGuardado?: (id:string)=>void; };

export default function AspiranteFormulario({ isEnabled = true, onGuardado }: Props) {
  const { formulario, actualizarCampo, errores, enviando, enviar, paso, siguiente, anterior, setPaso, reiniciarParaHermano } = useAspiranteFormulario();

  // Hooks al inicio (orden estable)
  const [resumen, setResumen] = React.useState<{ id: string; datos: Aspirante } | null>(null);
  const [enviado, setEnviado] = React.useState(false);
  const [folio, setFolio] = React.useState<string | null>(null);
  const progreso = React.useMemo(() => ((paso - 1) / 4) * 100, [paso]);

  async function handleEnviar() {
    const res = await enviar();
    if (!res.ok) {
      // saltar al paso con error y enfocar primer campo
      if (res.step) setPaso(res.step);
      setTimeout(() => {
        if (res.firstError) {
          const el = document.getElementById(res.firstError);
          if (el && typeof (el as any).focus === "function") (el as any).focus();
          if (el && el.scrollIntoView) el.scrollIntoView({ behavior: "smooth", block: "center" });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }, 0);
      return;
    }
    // éxito
    setResumen({ id: res.id, datos: { ...formulario } });
    setFolio(res.id);
    setEnviado(true);
    onGuardado?.(res.id);
  }

  let content: React.ReactNode;

  if (!isEnabled) {
    content = (
      <section className="disabled-card" aria-live="polite">
        <h2 className="text-xl font-semibold">Formulario temporalmente inactivo</h2>
        <p className="mt-2">El registro de aspirantes se abrirá pronto. Te informaremos cuando el formulario esté activo.</p>
        <p className="help mt-1">Para más información contacta a la secretaría académica.</p>
      </section>
    );
  } else if (enviado) {
    content = (
      <section className="success-card" role="status" aria-live="polite">
        <div style={{display:'flex',justifyContent:'center',marginBottom:'.5rem'}}>
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="#10b981" strokeWidth="2" fill="#ecfdf5"></circle>
            <path d="M8 12.5l2.5 2.5L16 9" stroke="#10b981" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2>¡Solicitud enviada!</h2>
        <p className="muted">
          Hemos recibido la información de inscripción.
          <br />Secretaría académica se comunicará contigo con los pasos a seguir.
        </p>
        {folio && <p style={{marginTop:'.75rem'}}><b>Número de radicado:</b> {folio}</p>}

        <div className="actions" style={{justifyContent:'center', marginTop:'1rem'}}>
          <button
            className="btn btn--primary"
            type="button"
            onClick={()=>{
              setEnviado(false);
              setFolio(null);
              reiniciarParaHermano(); // conserva padres/recomendador
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            Registrar un hermano
          </button>
        </div>
      </section>
    );
  } else {
    content = (
      <>
        {/* Stepper */}
        <nav aria-label="Progreso" className="stepper" role="navigation">
          {[1,2,3,4].map(i => (
            <React.Fragment key={i}>
              <div className={`stepper__dot ${paso===i?'stepper__dot--active':''}`} aria-current={paso===i?'step':'false'}>{i}</div>
              {i<4 && <div className={`stepper__line ${paso>i?'stepper__line--active':''}`}></div>}
            </React.Fragment>
          ))}
        </nav>
        <div className="progress" aria-hidden="true"><div className="progress__bar" style={{ width: `${progreso}%` }}/></div>

        {/* PASO 1 */}
        {paso===1 && (
          <fieldset className="panel" aria-labelledby="t1">
            <legend id="t1">DATOS DE IDENTIFICACIÓN DEL ASPIRANTE</legend>
            <div className="grid grid--2">
              <Campo id="nombres" label="Nombres" value={formulario.nombres} onChange={actualizarCampo} error={errores["nombres"]}/>
              <Campo id="apellidos" label="Apellidos" value={formulario.apellidos} onChange={actualizarCampo} error={errores["apellidos"]}/>
              <Campo id="fechaNacimiento" type="date" label="Fecha de nacimiento" value={formulario.fechaNacimiento} onChange={actualizarCampo} error={errores["fechaNacimiento"]}/>
              <Campo id="lugarNacimiento" label="Lugar de nacimiento" value={formulario.lugarNacimiento} onChange={actualizarCampo} error={errores["lugarNacimiento"]}/>
              <Select id="sexo" label="Sexo" value={formulario.sexo} onChange={actualizarCampo} error={errores["sexo"]}
                options={[{v:"M",t:"Masculino"},{v:"F",t:"Femenino"}]} />
              <div className="grid grid--2">
                <Campo id="edadAnios" type="number" label="Edad actual en (años)" value={formulario.edadAnios} onChange={actualizarCampo} error={errores["edadAnios"]}/>
                <Campo id="edadMeses" type="number" label="y (meses)" value={formulario.edadMeses} onChange={actualizarCampo} error={errores["edadMeses"]}/>
              </div>
              <Campo id="direccionResidencia" label="Dirección de residencia" value={formulario.direccionResidencia} onChange={actualizarCampo} error={errores["direccionResidencia"]}/>
              <Campo id="barrioAspirante" label="Barrio" value={formulario.barrioAspirante} onChange={actualizarCampo} error={errores["barrioAspirante"]}/>
              <Campo id="telefonoCasa" label="Teléfono de casa" value={formulario.telefonoCasa} onChange={actualizarCampo} error={errores["telefonoCasa"]} help="Incluye indicativo si aplica."/>
              <Campo id="religion" label="Religión" value={formulario.religion} onChange={actualizarCampo} error={errores["religion"]}/>
              <Campo id="colegioProcedencia" label="Colegio de procedencia" value={formulario.colegioProcedencia} onChange={actualizarCampo} error={errores["colegioProcedencia"]}/>
              <Campo id="ultimoGrado" label="Último grado cursado" value={formulario.ultimoGrado} onChange={actualizarCampo} error={errores["ultimoGrado"]}/>
            </div>
            <div className="actions">
              <button className="btn btn--primary" type="button" onClick={()=>siguiente() && window.scrollTo({top:0,behavior:'smooth'})}>Siguiente</button>
            </div>
          </fieldset>
        )}

        {/* PASO 2 */}
        {paso===2 && (
          <DatosPadreOMadre
            titulo="Datos del Padre" base="padre" valores={formulario.padre}
            errores={errores} onChange={actualizarCampo}
            onPrev={()=>anterior()} onNext={()=>siguiente() && window.scrollTo({top:0,behavior:'smooth'})}
          />
        )}

        {/* PASO 3 */}
        {paso===3 && (
          <DatosPadreOMadre
            titulo="Datos de la Madre" base="madre" valores={formulario.madre}
            errores={errores} onChange={actualizarCampo}
            onPrev={()=>anterior()} onNext={()=>siguiente() && window.scrollTo({top:0,behavior:'smooth'})}
          />
        )}

        {/* PASO 4 */}
        {paso===4 && (
          <fieldset className="panel" aria-labelledby="t4">
            <legend id="t4">PERSONA QUE RECOMENDÓ EL CENTRO EDUCATIVO</legend>
            <div className="grid grid--3">
              <Campo id="recomendador.nombresApellidos" label="Nombres y apellidos" value={formulario.recomendador.nombresApellidos} onChange={actualizarCampo} error={errores["recomendador.nombresApellidos"]}/>
              <Campo id="recomendador.telefono" label="Teléfono / celular" value={formulario.recomendador.telefono} onChange={actualizarCampo} error={errores["recomendador.telefono"]}/>
              <Campo id="recomendador.parentesco" label="Parentesco" value={formulario.recomendador.parentesco} onChange={actualizarCampo} error={errores["recomendador.parentesco"]}/>
            </div>

            <fieldset className="panel" style={{marginTop:'1rem'}}>
              <legend>ANEXAR</legend>
              <Campo id="familiaresEnColegio" label="¿Tiene familiares en el colegio? (nombres y parentesco)" value={formulario.familiaresEnColegio} onChange={actualizarCampo} error={errores["familiaresEnColegio"]}/>
            </fieldset>

            <div className="actions">
              <button className="btn" type="button" onClick={()=>anterior()}>Atrás</button>
              <button className="btn btn--primary" type="button" onClick={()=>{ setPaso(5); window.scrollTo({top:0,behavior:'smooth'})}}>Revisar y enviar</button>
            </div>
          </fieldset>
        )}

        {/* PASO 5 – Resumen + Términos */}
        {paso===5 && (
          <fieldset className="panel" id="resumen-inscripcion">
            <legend>Resumen de la inscripción</legend>
            <p className="notice">Verifica que los datos estén correctos. Puedes imprimir con <span className="kbd">Ctrl</span>+<span className="kbd">P</span>.</p>

            <div className="summary" style={{marginTop:'.75rem'}}>
              <Resumen datos={resumen?.datos ?? formulario}/>
            </div>

            <div style={{marginTop:'1rem'}}>
              <label className="label" htmlFor="aceptaTerminos">Términos y condiciones</label>
              <div style={{display:'flex',alignItems:'center',gap:'.5rem'}}>
                <input
                  id="aceptaTerminos" type="checkbox"
                  checked={formulario.aceptaTerminos}
                  onChange={(e)=>actualizarCampo("aceptaTerminos", e.target.checked)}
                  className="checkbox"
                  aria-invalid={!!errores["aceptaTerminos"]}
                  aria-describedby={errores["aceptaTerminos"] ? "aceptaTerminos-err" : undefined}
                />
                <span>
                  He leído y acepto los{" "}
                  <a href="/terminos-y-condiciones" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">
                    Términos y condiciones
                  </a>.
                </span>
              </div>
              {errores["aceptaTerminos"] && <div id="aceptaTerminos-err" className="error">{errores["aceptaTerminos"]}</div>}
            </div>

            <div className="actions">
              <button className="btn" type="button" onClick={()=>setPaso(1)}>Editar</button>
              <button className="btn" type="button" onClick={()=>window.print()}>Imprimir</button>
              <button className="btn btn--primary" type="button" disabled={enviando} onClick={handleEnviar}>
                {enviando ? "Enviando…" : "Confirmar y enviar"}
              </button>
            </div>
          </fieldset>
        )}
      </>
    );
  }

  return (
    <div className="screen">
      <div className="screen__center aspirantes">
        <div className="container">
          {content}
        </div>
      </div>
    </div>
  );
}

/* ---------- Subcomponentes ---------- */
function Campo(props:{id:string; label:string; value:string; onChange:(id:string,v:string)=>void; error?:string; type?:React.HTMLInputTypeAttribute; help?:string;}){
  const {id,label,value,onChange,error,type='text',help}=props;
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      <input id={id} name={id} className="input" type={type} value={value}
        onChange={e=>onChange(id, e.target.value)} aria-invalid={!!error} aria-describedby={error?`${id}-err`:undefined}/>
      {help && <div className="help">{help}</div>}
      {error && <div id={`${id}-err`} className="error">{error}</div>}
    </div>
  );
}

function Select(props:{id:string; label:string; value:string; onChange:(id:string,v:string)=>void; error?:string; options:{v:string,t:string}[];}){
  const {id,label,value,onChange,error,options}=props;
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      <select id={id} className="select" value={value} onChange={e=>onChange(id, e.target.value)}
        aria-invalid={!!error} aria-describedby={error?`${id}-err`:undefined}>
        {options.map(o=><option key={o.v} value={o.v}>{o.t}</option>)}
      </select>
      {error && <div id={`${id}-err`} className="error">{error}</div>}
    </div>
  );
}

function DatosPadreOMadre({titulo, base, valores, errores, onChange, onPrev, onNext}:{
  titulo:string; base:"padre"|"madre"; valores:any; errores:Record<string,string>;
  onChange:(ruta:string,valor:string)=>void; onPrev:()=>void; onNext:()=>void;
}){
  const id=(k:string)=>`${base}.${k}`;
  return (
    <fieldset className="panel" aria-labelledby={`${base}-ttl`}>
      <legend id={`${base}-ttl`}>{titulo}</legend>
      <div className="grid grid--3">
        <Campo id={id("nombresApellidos")} label="Nombres y apellidos" value={valores.nombresApellidos} onChange={onChange} error={errores[id("nombresApellidos")]}/>
        <Campo id={id("numeroIdentificacion")} label="Número de identificación" value={valores.numeroIdentificacion} onChange={onChange} error={errores[id("numeroIdentificacion")]}/>
        <Campo id={id("telefono")} label="Teléfono" value={valores.telefono} onChange={onChange} error={errores[id("telefono")]}/>
        <Campo id={id("direccion")} label="Dirección" value={valores.direccion} onChange={onChange} error={errores[id("direccion")]}/>
        <Campo id={id("barrio")} label="Barrio" value={valores.barrio} onChange={onChange} error={errores[id("barrio")]}/>
        <Campo id={id("email")} label="Email" value={valores.email} onChange={onChange} error={errores[id("email")]}/>
        <Campo id={id("empresa")} label="Empresa donde trabaja" value={valores.empresa} onChange={onChange} error={errores[id("empresa")]}/>
        <Campo id={id("profesion")} label="Profesión u oficio" value={valores.profesion} onChange={onChange} error={errores[id("profesion")]}/>
      </div>
      <div className="actions">
        <button className="btn" type="button" onClick={onPrev}>Atrás</button>
        <button className="btn btn--primary" type="button" onClick={onNext}>Siguiente</button>
      </div>
    </fieldset>
  );
}

function Resumen({datos}:{datos:Aspirante}){
  return (
    <article>
      <h3>1) Aspirante</h3>
      <ul>
        <li><b>Nombre:</b> {datos.nombres} {datos.apellidos}</li>
        <li><b>Nacimiento:</b> {datos.fechaNacimiento} – {datos.lugarNacimiento}</li>
        <li><b>Sexo:</b> {datos.sexo==='M'?'Masculino':'Femenino'}</li>
        <li><b>Edad:</b> {datos.edadAnios} años, {datos.edadMeses} meses</li>
        <li><b>Dirección:</b> {datos.direccionResidencia}, Barrio {datos.barrioAspirante}</li>
        <li><b>Teléfono:</b> {datos.telefonoCasa}</li>
        <li><b>Religión:</b> {datos.religion}</li>
        <li><b>Colegio de procedencia:</b> {datos.colegioProcedencia}</li>
        <li><b>Último grado:</b> {datos.ultimoGrado}</li>
      </ul>
      <h3>2) Padre</h3>
      <ul>
        <li><b>Nombre:</b> {datos.padre.nombresApellidos}</li>
        <li><b>ID:</b> {datos.padre.numeroIdentificacion}</li>
        <li><b>Contacto:</b> {datos.padre.telefono} – {datos.padre.email}</li>
        <li><b>Dirección:</b> {datos.padre.direccion}, {datos.padre.barrio}</li>
        <li><b>Empresa y oficio:</b> {datos.padre.empresa} – {datos.padre.profesion}</li>
      </ul>
      <h3>3) Madre</h3>
      <ul>
        <li><b>Nombre:</b> {datos.madre.nombresApellidos}</li>
        <li><b>ID:</b> {datos.madre.numeroIdentificacion}</li>
        <li><b>Contacto:</b> {datos.madre.telefono} – {datos.madre.email}</li>
        <li><b>Dirección:</b> {datos.madre.direccion}, {datos.madre.barrio}</li>
        <li><b>Empresa y oficio:</b> {datos.madre.empresa} – {datos.madre.profesion}</li>
      </ul>
      <h3>4) Recomendador / Anexos</h3>
      <ul>
        <li><b>Recomendó:</b> {datos.recomendador.nombresApellidos} ({datos.recomendador.parentesco}) – {datos.recomendador.telefono}</li>
        <li><b>Familiares en el colegio:</b> {datos.familiaresEnColegio}</li>
      </ul>
    </article>
  );
}
