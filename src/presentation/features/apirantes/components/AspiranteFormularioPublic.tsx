// src/features/aspirantes/components/AspiranteFormularioPublic.tsx
import React from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../../../infrastructure/firebase/firebase";
import AspiranteFormulario from "./AspiranteFormulario";

export default function AspiranteFormularioPublic(){
  const [enabled, setEnabled] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(()=>{
    const ref = doc(db, "featureFlags/aspirantesPublic");
    const stop = onSnapshot(ref,
      (s)=>{
        setEnabled(Boolean(s.data()?.enabled ?? false));
        setLoading(false);
      },
      // Si falla (permiso, doc no existe), cerramos como deshabilitado por seguridad
      ()=>{
        setEnabled(false);
        setLoading(false);
      }
    );
    return ()=>stop();
  },[]);

  if (loading) {
    return (
      <div className="screen"><div className="screen__center"><div className="container">Cargando…</div></div></div>
    );
  }

  return <AspiranteFormulario isEnabled={enabled} />;
}
