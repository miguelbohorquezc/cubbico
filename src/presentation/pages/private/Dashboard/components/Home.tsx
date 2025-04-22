
import Navbar from "../../../../components/navbar/Navbar"
import Sidebar from "../../../../components/sidebar/Sidebar"
import logo from '../../../../../assets/home.svg';



function Home() {
  return (
    <>
      <Sidebar/>
      <div className='container-page'>
        <div className='header-container-page'>
            <Navbar/>
            <div className='title-option'>             
              <h2>Home</h2>
            </div>
          </div>
          <div className='body-container-page'> 
            <img src={logo} alt="" width={'350px'}/>
          </div>
      </div>
    </>
  )
}

export default Home