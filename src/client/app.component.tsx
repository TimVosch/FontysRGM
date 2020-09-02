import React, { Component } from "react";
import { HashRouter as Router, Switch, Route } from "react-router-dom";
import SocketIO from "socket.io-client";
import { Viewer } from "./viewer/viewer.component";
import { RGM52Page } from "./machines/rgm52/rgm52.component";
import { RGM51Page } from "./machines/rgm51/rgm51.component";

import "./app.component.css";

const socket = SocketIO();

export class App extends Component {
  render() {
    return (
      <Router>
        <Switch>
          {/* Machines */}
          <Route path="/machines/51">
            <RGM51Page socket={socket} />
          </Route>
          <Route path="/machines/52">
            <RGM52Page socket={socket} />
          </Route>
          {/* Viewer */}
          <Route path="/">
            <Viewer socket={socket} />
          </Route>
        </Switch>
      </Router>
    );
  }
}
