import React, { Component } from "react";
import { HashRouter as Router, Switch, Route } from "react-router-dom";
import { Viewer } from "./viewer/viewer.component";
import { RGM52Page } from "./machines/rgm52/rgm52.component";
import { RGM51Page } from "./machines/rgm51/rgm51.component";

import "./app.component.css";

export class App extends Component {
  render() {
    return (
      <Router>
        <Switch>
          {/* Machines */}
          <Route path="/machines/51">
            <RGM51Page />
          </Route>
          <Route path="/machines/52">
            <RGM52Page />
          </Route>
          {/* Viewer */}
          <Route path="/">
            <Viewer />
          </Route>
        </Switch>
      </Router>
    );
  }
}
