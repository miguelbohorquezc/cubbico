import { useNavigate } from "react-router-dom";
import Navbar from "../../../../components/navbar/Navbar"
import Sidebar from "../../../../components/sidebar/Sidebar"
import CreateUserForm from "../../../../components/userForm/CreateUserForm"
import Button from "../../../../features/button/Button"
import Modal from "../../../../components/modal/Modal";
import { useState } from "react";

function User() {

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
                Registrar nuevo usuario
              </Button>            
              <h2>Crear Usuarios</h2>
            </div>
          </div>
          <div className='body-container-page'> 
            
          </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Crear Salón de Clases"
      >
        <div>
          <CreateUserForm/>
        </div>
      </Modal>
    </>
  )
}
export default User