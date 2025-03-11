
import { useParams } from 'react-router-dom';
import Sidebar from '../../../../components/sidebar/Sidebar';
import { useState } from 'react';
import Modal from '../../../../components/modal/Modal';
import AchievementForm from '../../../../components/achievement/AchievementForm';

function Academy() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { classroomId, areaId, periodId } = useParams();

  return (
    <>
      <Sidebar/>
      <button onClick={() => setIsModalOpen(true)}>
        {`${classroomId} - ${areaId} - ${periodId}`}
      </button>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Registro de logros académicos"
      >
        <div>
          <AchievementForm/>
        </div>
      </Modal>
    </>
  )
}

export default Academy