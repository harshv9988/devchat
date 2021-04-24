import React, { Component } from "react";
import { Form, Icon, Menu, Modal, Button, Input } from "semantic-ui-react";

export class Channels extends Component {
  state = {
    channels: [],
    modal: false,
    channelName: "",
    channelDetails: "",
  };

  closeModal = () => {
    this.setState({ modal: false });
  };

  openModal = () => {
    this.setState({ modal: true });
  };

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  render() {
    const { channels, modal } = this.state;
    return (
      <>
        <Menu.Menu style={{ paddigBottom: "2.em", marginTop: 10 }}>
          <Menu.Item>
            <span>
              <Icon name="exchange" /> CHANNELS
            </span>
            ({channels.length})
            <Icon
              name="add"
              onClick={this.openModal}
              style={{ cursor: "pointer" }}
            />
          </Menu.Item>
          {/* channels */}
        </Menu.Menu>
        <Modal
          basic
          open={modal}
          onClose={this.closeModal}
          onOpen={this.openModal}
        >
          <Modal.Header>Add a Channel</Modal.Header>
          <Modal.Content>
            <Form>
              <Form.Field>
                <Input
                  fluid
                  label="Name of Channel"
                  name="channelname"
                  onChange={this.handleChange}
                ></Input>
              </Form.Field>
              <Form.Field>
                <Input
                  fluid
                  label="About the Channel"
                  name="channelDetails"
                  onChange={this.handleChange}
                ></Input>
              </Form.Field>
            </Form>
          </Modal.Content>
          <Modal.Actions>
            <Button color="green" inverted>
              <Icon name="checkmark" />
              Add
            </Button>
            <Button color="red" inverted onClick={this.closeModal}>
              <Icon name="remove" />
              Cancel
            </Button>
          </Modal.Actions>
        </Modal>
      </>
    );
  }
}

export default Channels;
