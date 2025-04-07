
import {useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../../../components/sidebar/Sidebar';
import GestorIndicadores from '../../../../features/preschool/GestorIndicadores';
import Navbar from '../../../../components/navbar/Navbar';
import Button from '../../../../features/button/Button';

function ConfigIndicadores() {

  const { classroomId = '', periodId = '' } = useParams();
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
              <h2>Configurar Indicadores | periodo {periodId}</h2>
            </div>
          </div>
          <div className='body-container-page'> 
          <GestorIndicadores classRoomId={classroomId} year='2025' periodo={parseInt(periodId)}/>
          </div>
      </div>
    </>
    
  )
}

export default ConfigIndicadores