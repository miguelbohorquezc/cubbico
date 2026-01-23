import Navbar from "../../../../components/navbar/Navbar"
import { SidebarV2 } from "../../../../components/sidebarV2"
import logo from '../../../../../assets/home.svg';

function Home() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarV2 />
      <div className="flex-1 flex flex-col min-w-0">
        <div className='header-container-page'>
          <Navbar/>
          <div className='title-option'>
            <h2>Home</h2>
          </div>
        </div>
        <div className='body-container-page flex-1 flex items-center justify-center'>
          <img src={logo} alt="Cubbico Home" width={'350px'}/>
        </div>
      </div>
    </div>
  )
}

export default Home