import { useNavigate } from "react-router-dom";
import Navbar from "../../../../components/navbar/Navbar"
import Sidebar from "../../../../components/sidebar/Sidebar"
import Button from "../../../../features/button/Button"
import Modal from "../../../../components/modal/Modal";
import { useState } from "react";
import AreaForm from "../../../../components/areaForm/AreaForm";
import AreaList from "../../../../features/students/AreaList";
import { AreaServiceData } from "../../../../../shared/types/areaTypes";
import { addArea } from "../../../../../infrastructure/area.service";

function AreaPage() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshList, setRefreshList] = useState(false);
  
  const [areas, setAreas] = useState<AreaServiceData[]>([]);

  const handleFormSubmitSuccess = () => {
    setIsModalOpen(false);
    setRefreshList(prev => !prev); // Forzar actualización de la lista
  };

  const handleAddArea = async (formData: AreaServiceData) => {
    try {
      // Elimina el id antes de enviar a Firestore
      const { id, ...areaData } = formData;
      const newAreaId = await addArea(areaData);
      
      // Agrega el nuevo área al estado con el id generado
      setAreas(prev => [...prev, { ...formData, id: newAreaId }]);
      setIsModalOpen(false);
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
              <h2>Lista de áreas</h2>
            </div>
          </div>
          <div className='body-container-page'> 
            <AreaList key={refreshList.toString()} />
          </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nueva Área Académica"
      >
        <AreaForm onSubmit={handleAddArea} />
      </Modal>
    </>
  )
}
export default AreaPage