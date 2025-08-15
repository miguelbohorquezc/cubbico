import React from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../../../infrastructure/firebase/firebase";
import MatriculaFormulario from "./MatriculaFormulario";

export default function MatriculaFormularioPublic(){
  const [enabled, setEnabled] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(()=>{
    const ref = doc(db, "featureFlags/matriculaPublic");
    const stop = onSnapshot(ref, (s)=>{
      setEnabled(Boolean(s.data()?.enabled ?? false));
      setLoading(false);
    }, ()=>{
      setEnabled(false); setLoading(false);
    });
    return ()=>stop();
  },[]);

  if(loading) {
    return (
      <div className="screen"><div className="screen__center"><div className="container">Cargando…</div></div></div>
    );
  }
  return <MatriculaFormulario isEnabled={enabled} />;
}
