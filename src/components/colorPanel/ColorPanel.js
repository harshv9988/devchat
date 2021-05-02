import React, { Component } from "react";
import {
  Sidebar,
  Menu,
  Divider,
  Button,
  Modal,
  Icon,
  Label,
  Grid,
  Segment,
} from "semantic-ui-react";

import { SliderPicker, GithubPicker } from "react-color";

export class ColorPanel extends Component {
  state = {
    modal: false,
  };

  openModal = () => this.setState({ modal: true });

  closeModal = () => this.setState({ modal: false });

  render() {
    const { modal } = this.state;
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
          <Button
            icon="add"
            size="small"
            color="blue"
            onClick={this.openModal}
          />

          {/* color picker */}
          <Modal basic open={modal} onClose={this.closeModal}>
            <Modal.Header>Choose App Colors</Modal.Header>
            <Modal.Content>
              <Grid divided="vertically" centered columns={2}>
                <Grid.Column>
                  <Segment padded>
                    <Label attached="top" content="Primary Color" />
                    <GithubPicker />
                  </Segment>
                </Grid.Column>
                <Grid.Column>
                  <Segment padded>
                    <Label attached="top" content="Secondary Color" />
                    <GithubPicker />
                  </Segment>
                </Grid.Column>
              </Grid>
            </Modal.Content>
            <Modal.Actions>
              <Button color="green" inverted>
                <Icon name="checkmark" /> Save Colors
              </Button>
              <Button color="red" inverted onClick={this.closeModal}>
                <Icon name="remove" /> Cancel
              </Button>
            </Modal.Actions>
          </Modal>
        </Sidebar>
      </div>
    );
  }
}

export default ColorPanel;
