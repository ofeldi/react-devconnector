import React, {Component} from 'react';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
//import { createStore, applyMiddleWare } from 'redux';


import './App.css';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Landing from './components/layout/Landing';
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import {applyMiddleware} from "redux";




class App extends Component {
    render() {

        return (
            <Provider store={store}>
                <Router>
                    <div className="App">
                        <Navbar/>
                        <Route exact path="/" component={Landing}/>
                        <div className="container">
                            <Route exact path="/Register" component={Register}/>
                            <Route exact path="/Login" component={Login}/>
                        </div>
                        <Footer/>
                    </div>
                </Router>
            </Provider>
        );
    }

}

export default App;
