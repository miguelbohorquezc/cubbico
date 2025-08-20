import { useNavigate } from "react-router-dom";
import Navbar from "../../../../components/navbar/Navbar";
import Sidebar from "../../../../components/sidebar/Sidebar";
import Tooltip from "../../../../components/toolTip/Tooltip";
import arrowIcons from "../../../../../assets/navbarIcons/arrow.svg"
import AspirantesAdmin from "../../../../features/aspirantes-admin/components/AspirantesAdmin";

export default function AspirantesAdminPage(){
  const navigate = useNavigate();
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
                </div>
              </div>
              <div className='body-container-page'> 
                <main style={{ width: '100%' }}>
                  <AspirantesAdmin />
                </main>
              </div>
          </div>
        </>
    
  );
}
