import { Navigation, NavigationControl } from "../../../components"
import home from '../../../assets/homeVectorGray.svg'
import './home.css'

function Home() {

  return (
    <div className="home-container">
      <Navigation/>
      <NavigationControl/>
      <h5>Sistema Institucional Académico - Colina Campestre School.</h5>
      <img className="homeVector" src={home} alt="" />
    </div>
  )
}
export default Home