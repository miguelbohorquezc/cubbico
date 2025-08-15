// src/presentation/pages/public/AspirantesPage.tsx

import logo from "../../../assets/logo/Logo.svg"
import AspiranteFormularioPublic from "../../features/apirantes/components/AspiranteFormularioPublic";

export default function AspirantesPage() {
  return (
    <main className="p-6">
      <img className="sidebar-icons-option" src={logo} alt="Cerrar sidebar" width={"70px"}/>
      <h2>Registro de Aspirantes</h2>
      <AspiranteFormularioPublic/>
    </main>
  );
}
