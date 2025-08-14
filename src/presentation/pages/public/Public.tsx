// src/presentation/pages/public/AspirantesPage.tsx

import AspiranteFormulario from "../../features/apirantes/components/AspiranteFormulario";
import logo from "../../../assets/logo/Logo.svg"

export default function AspirantesPage() {
  return (
    <main className="p-6">
      <img className="sidebar-icons-option" src={logo} alt="Cerrar sidebar" width={"70px"}/>
      <h2>Registro de Aspirantes</h2>
      <AspiranteFormulario
        isEnabled={true}
        onGuardado={(id) => alert(`Solicitud enviada. ID: ${id}`)}
      />
    </main>
  );
}
