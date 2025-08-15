import Navbar from "../../../../components/navbar/Navbar";
import Sidebar from "../../../../components/sidebar/Sidebar";
import AspirantesAdmin from "../../../../features/aspirantes-admin/components/AspirantesAdmin";

export default function AspirantesAdminPage(){
  return (
    <>
          <Sidebar/>
          <div className='container-page'>
            <div className='header-container-page'>
                <Navbar/>
                <div className='title-option'>             
                 
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
