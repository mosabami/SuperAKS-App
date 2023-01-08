import { Component } from "react";
// import useAnalyticsEventTracker from "./GoogleAnalytics";



class  Navigation extends Component {

  constructor(props) {
    super(props);
    this.state = this.props.data;
    console.log(this.props.data.showBanner)
    this.state.nav = [{text:'Home',link:'/home'},{link:'/otherpage',text:'Other page'}]
    // const [navbar, setNavbar] = useState(false);
    // this.onRouteChange = this.props.onRouteChange
  }

  
    
  render() {
    return (
      // https://larainfo.com/blogs/react-responsive-navbar-menu-with-tailwind-css-example
    <div> 
      <nav className="w-full bg-white shadow">
          <div className="justify-between px-4 mx-auto lg:max-w-7xl md:items-center md:flex md:px-8">
              <div>
                  <div className="flex items-center justify-between py-3 md:py-5 md:block">
                      <a href="https://mosabami.github.io/highpoint-masjid">
                      </a>
                      <div className="md:hidden">
 
                      </div>
                  </div>
              </div>
              <div>
                  <div
                      className={`flex-1 justify-self-center pb-3 mt-8 md:block md:pb-0 md:mt-0 ${
                         "block" 
                      }`}
                  >
                      <ul className="items-center justify-center space-y-8 md:flex md:space-x-6 md:space-y-0">

                      {this.state.nav.map((item) => (

                    <li className="text-xl  hover:text-red-900 hover:text-italics" key={item.link}>
                    <p   onClick={() => {
                      this.props.onRouteChange(item.link)
                      }
                    }>
                      {item.text}
                    </p>
                    </li>

                  ))}


                      </ul>
                  </div>
              </div>
          </div>
      </nav>

      <div className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <svg
              className="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-white transform translate-x-1/2"
              fill="currentColor"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <polygon points="50,0 100,0 50,100 0,100" />
            </svg>
  
            <div className="relative pt-6 px-4 sm:px-6 lg:px-8">
              <nav className="relative flex items-center justify-between sm:h-24 lg:justify-start" aria-label="Global">
                <div className="flex items-center flex-grow flex-shrink-0 lg:flex-grow-0">
                  <div className="flex items-center justify-between w-full md:w-auto">
                    <h3 >
                  
                        <span className="sr-only">Fib Calculator</span>
                        {/* <img
                          className={`${this.state.branding.larger_logo ? "h-32" : "h-16"} w-auto`}
                          src={this.state.branding.logo_url}
                          alt="hero"
                        /> */}
                     
                    </h3>
                  </div>
                </div>
                <div className="xhidden md:block md:ml-10 pr-4 space-x-8">

                </div>
              </nav>
            </div>

          </div>
        </div>
      </div>  

  </div>    
  );
  }

}

export default Navigation