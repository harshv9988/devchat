import React, { Component } from "react";
import { Sidebar, Menu, Divider, Button } from "semantic-ui-react";

export class ColorPanel extends Component {
  render() {
    return (
      <div>
        <Sidebar
          as={Menu}
          icon="labelled"
          inverted
          vertical
          visible
          with="very thin"
        >
          <Divider />
          <Button icon="add" size="small" color="blue" />
        </Sidebar>
      </div>
    );
  }
}

export default ColorPanel;
