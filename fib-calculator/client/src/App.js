import './App.css';
// import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import OtherPage from './OtherPage';
import Fib from './Fib';
import React, { Component } from 'react';
import Navigation from './Navigation';

class App extends Component {
  constructor() {
    super();
    this.state = {}
    this.state.route = '/home'
    
  };

  onRouteChange = (route) => {
    this.setState({ route: route });
    console.log(this.state.route)
  }

  render() {
    // let data = this.state
    return (
      <div className="App">
      <header className="App-header">
      <Navigation data={this.state} onRouteChange={this.onRouteChange} showBanner = {this.state.showBanner} />
      {
        this.state.route === '/home'
        ? 
        <div>
        <Fib/>
        </div>
        : 
        <div>
          <OtherPage />
        </div>
      }
      </header>
    </div>
    );
  }
}


// function App() {
//   return (
//       <div className="App">
//         <header className="App-header">
//           <Link to="/">Home</Link>
//           <Link to="/otherpage">Other Page</Link>
//           <div>
//           <Route exact path="/" component={Fib} />
//           <Route path="/otherpage" component={OtherPage} />
//         </div>
//         </header>
//       </div>
//   );
// }

export default App;
