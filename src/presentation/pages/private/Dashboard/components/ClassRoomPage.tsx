import { useNavigate } from "react-router-dom";
import Navbar from "../../../../components/navbar/Navbar"
import Sidebar from "../../../../components/sidebar/Sidebar"
import Button from "../../../../features/button/Button"
import Modal from "../../../../components/modal/Modal";
import { useState } from "react";
import ClassRoomForm from "../../../../components/classRoomForm/ClassRoomForm";
import ClassRoomList from "../../../../features/students/ClassRoomList";

function ClassRoomPage() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
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
                Crear salones
              </Button>              
              <h2>Salones de clase</h2>
            </div>
          </div>
          <div className='body-container-page'> 
          <ClassRoomList/>
          </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Crear Salón de Clases"
      >
        <div>
          <ClassRoomForm onSubmit={() => {
              setIsModalOpen(false);
              // Aquí podrías recargar la lista si es necesario
            }}
          />
        </div>
      </Modal>
    </>
  )
}
export default ClassRoomPage