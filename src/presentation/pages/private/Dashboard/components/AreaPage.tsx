import { useNavigate } from "react-router-dom";
import Navbar from "../../../../components/navbar/Navbar"
import Sidebar from "../../../../components/sidebar/Sidebar"
import Button from "../../../../features/button/Button"
import Modal from "../../../../components/modal/Modal";
import { useState, useEffect } from "react";
import AreaForm from "../../../../components/areaForm/AreaForm";
import AreaListDragDrop from "../../../../features/students/AreaListDragDrop";
import { AreaServiceData } from "../../../../../shared/types/areaTypes";
import { addArea, fetchAreas } from "../../../../../infrastructure/area.service";

function AreaPage() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [areas, setAreas] = useState<AreaServiceData[]>([]);

  // Cargar áreas para el auto-cálculo de orden
  useEffect(() => {
    const loadAreas = async () => {
      try {
        const areasData = await fetchAreas();
        setAreas(areasData);
      } catch (error) {
        console.error('Error loading areas:', error);
      }
    };
    loadAreas();
  }, [refreshKey]);

  const handleAddArea = async (formData: AreaServiceData) => {
    try {
      // Elimina el id antes de enviar a Firestore
      const { id, ...areaData } = formData;
      await addArea(areaData);

      setIsModalOpen(false);
      // Forzar recarga de la lista incrementando la key
      setRefreshKey(prev => prev + 1);
      alert('Área creada exitosamente!');
      return true;
    } catch (error) {
      console.error('Error al crear área:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Error al crear área'}`);
      return false;
    }
  };

  return (
    <>
      <Sidebar/>
      <div className='container-page'>
        <div className='header-container-page'>
            <Navbar/>
            <div className='title-option'>
              <Button
                variant="primary" size="sm"
                onClick={() => navigate(-1)}>
                Regresar
              </Button>
              <Button
                variant="accent" size="sm"
                onClick={() => setIsModalOpen(true)}>
                Registrar área
              </Button>
              <h2>Gestión de Asignaturas</h2>
            </div>
          </div>
          <div className='body-container-page'>
            <AreaListDragDrop key={refreshKey} />
          </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nueva Área Académica"
      >
        <AreaForm onSubmit={handleAddArea} existingAreas={areas} />
      </Modal>
    </>
  )
}
export default AreaPage