import { useNavigate } from "react-router-dom";
import Navbar from "../../../../components/navbar/Navbar"
import Sidebar from "../../../../components/sidebar/Sidebar"
import StudentForm from "../../../../components/studentForm/StudentForm"
import Button from "../../../../features/button/Button"
import Modal from "../../../../components/modal/Modal";
import { useState } from "react";
import StudentList from "../../../../features/students/StudentsList";

function StudentsPage() {
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
                Matricular estudiantes
              </Button>              
              <h2>Estudiantes</h2>
            </div>
          </div>
          <div className='body-container-page'> 
            <StudentList/>
          </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Matricular Estudiantes"
      >
        <div>
          <StudentForm />
        </div>
      </Modal>
    </>
  )
}
export default StudentsPage