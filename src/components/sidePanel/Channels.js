import React, { Component } from "react";
import { Form, Icon, Menu, Modal, Button, Input } from "semantic-ui-react";
import firebase from "../../firebase";

export class Channels extends Component {
  state = {
    channels: [],
    modal: false,
    channelName: "",
    channelDetails: "",
    channelsRef: firebase.database().ref("channels"),
    user: this.props.currentUser,
  };

  componentDidMount() {
    this.addListeners();
  }

  addListeners = () => {
    let loadedChannels = [];
    this.state.channelsRef.on("child_added", (snap) => {
      loadedChannels.push(snap.val());
      this.setState({ channels: loadedChannels });
    });
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

  handleSubmit = (event) => {
    console.log("hey");
    event.preventDefault();

    if (this.isFormvalid(this.state)) {
      this.addChannel();
    }
  };

  addChannel = () => {
    const { channelsRef, channelDetails, channelName, user } = this.state;

    const key = channelsRef.push().key;

    const newChannel = {
      id: key,
      name: channelName,
      details: channelDetails,
      createdBy: {
        name: user.displayName,
        avatar: user.photoURL,
      },
    };

    channelsRef
      .child(key)
      .update(newChannel)
      .then(() => {
        this.setState({ channelName: "", channelDetails: "" });
        this.closeModal();
        console.log("channel added");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  isFormvalid = ({ channelName, channelDetails }) =>
    channelDetails && channelName;

  render() {
    const { channels, modal, channelName, channelDetails } = this.state;
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
          {channels.length > 0 &&
            channels.map((channel) => (
              <Menu.Item
                key={channel.id}
                onClick={() => console.log(channel)}
                name={channel.name}
                style={{ opacity: 0.7 }}
              >
                #{channel.name}
              </Menu.Item>
            ))}
        </Menu.Menu>
        <Modal
          basic
          open={modal}
          onClose={this.closeModal}
          onOpen={this.openModal}
        >
          <Modal.Header>Add a Channel</Modal.Header>
          <Modal.Content>
            <Form onSubmit={this.handleSubmit}>
              <Form.Field>
                <Input
                  fluid
                  label="Name of Channel"
                  name="channelName"
                  onChange={this.handleChange}
                  value={channelName}
                ></Input>
              </Form.Field>
              <Form.Field>
                <Input
                  fluid
                  label="About the Channel"
                  name="channelDetails"
                  onChange={this.handleChange}
                  value={channelDetails}
                ></Input>
              </Form.Field>
            </Form>
          </Modal.Content>
          <Modal.Actions>
            <Button color="green" inverted onClick={this.handleSubmit}>
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
