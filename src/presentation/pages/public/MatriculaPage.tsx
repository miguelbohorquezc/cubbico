import logo from "../../../assets/logo/Logo.svg"
import MatriculaFormularioPublic from "../../features/matricula/components/MatriculaFormularioPublic";

export default function MatriculaPage(){

  return (
    <main className="p-6">
      <img className="sidebar-icons-option" src={logo} alt="Cerrar sidebar" width={"70px"}/>
      <h2>Registro de Admisiones</h2>
      <MatriculaFormularioPublic />
    </main>
  );
}
