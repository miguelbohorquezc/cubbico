
import {useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../../../components/sidebar/Sidebar';
import InformeConfigurador from '../../../../features/preschool/InformeConfigurador';
import Button from '../../../../features/button/Button';
import Navbar from '../../../../components/navbar/Navbar';

function NotesPreschool() {

  const { classroomId = '' } = useParams();
  const navigate = useNavigate();

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
              <h2>Configurar Propósitos</h2>
            </div>
          </div>
          <div className='body-container-page'> 
          <InformeConfigurador classRoomId={classroomId} year='2025'/> 
          </div>
      </div>
    </>
  )
}

export default NotesPreschool