import { useNavigate } from "react-router-dom";
import Navbar from "../../../../components/navbar/Navbar"
import Sidebar from "../../../../components/sidebar/Sidebar"
import Modal from "../../../../components/modal/Modal";
import { useState } from "react";
import ClassRoomForm from "../../../../components/classRoomForm/ClassRoomForm";
import ClassRoomList from "../../../../features/students/ClassRoomList";
import arrowIcons from "../../../../../assets/navbarIcons/arrow.svg"
import addIcons from "../../../../../assets/navbarIcons/add.svg"
import Tooltip from "../../../../components/toolTip/Tooltip";

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
              <Tooltip text="Atras">
                <button className="nav-options">
                  <img src={arrowIcons} 
                      alt="back"
                      onClick={() => navigate(-1)} />
                </button>
              </Tooltip>
              <Tooltip text="Crear salón de clases">
                <button className="nav-options">
                  <img src={addIcons} 
                      alt="back"
                      onClick={() => setIsModalOpen(true)} />
                </button>            
              </Tooltip>
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