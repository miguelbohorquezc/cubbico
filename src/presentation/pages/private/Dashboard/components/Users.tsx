import { useNavigate } from "react-router-dom";
import Navbar from "../../../../components/navbar/Navbar"
import Sidebar from "../../../../components/sidebar/Sidebar"
import CreateUserForm from "../../../../components/userForm/CreateUserForm"
import Button from "../../../../features/button/Button"

function User() {

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
              <h2>Crear Usuarios</h2>
            </div>
          </div>
          <div className='body-container-page'> 
            <CreateUserForm/>
          </div>
      </div>
    </>
  )
}
export default User