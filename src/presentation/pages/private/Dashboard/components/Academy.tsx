
import { useParams } from 'react-router-dom';
import Sidebar from "../../../../components/sidebar/Sidebar"
import TeacherAreas from "../../../../features/teacher/TeacherAreas";
import TeacherClassrooms from "../../../../features/teacher/TeacherClassrooms";
import TeacherDataLoader from "../../../../features/teacher/TeacherDataLoader";
import AreaForm from '../../../../components/areaForm/AreaForm';
import Modal from '../../../../components/modal/Modal';
import { useState } from 'react';
import CreateUserForm from '../../../../components/userForm/CreateUserForm';


function Academy() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { classroomId } = useParams();

  return (
    <>
      <TeacherDataLoader/>
      <Sidebar/>
      <TeacherClassrooms/>
      {classroomId && <TeacherAreas/>}
      {/* <AreaForm/> */}
      {/* <button onClick={() => setIsModalOpen(true)}>
        Abrir Modal
      </button>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Mi Modal TS"
      >
        <div>
          <CreateUserForm/>
          <button onClick={() => console.log("Click en modal")}>
            Acción
          </button>
        </div>
      </Modal> */}
    </>
  )
}

export default Academy