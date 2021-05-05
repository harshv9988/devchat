import React, { Component } from "react";
import {
  Form,
  Icon,
  Menu,
  Modal,
  Button,
  Input,
  Label,
} from "semantic-ui-react";
import firebase from "../../firebase";
import { connect } from "react-redux";
import { setCurrentChannel, setPrivateChannel } from "../../actions/index";

export class Channels extends Component {
  state = {
    channels: [],
    modal: false,
    channelName: "",
    channelDetails: "",
    channelsRef: firebase.database().ref("channels"),
    user: this.props.currentUser,
    firstLoad: true,
    activeChannel: "",
    channel: null,
    messagesRef: firebase.database().ref("messages"),
    notifications: [],
    typingRef: firebase.database().ref("typing"),
  };

  componentDidMount() {
    this.addListeners();
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  removeListeners = () => {
    this.state.channelsRef.off();
  };

  addListeners = () => {
    let loadedChannels = [];
    this.state.channelsRef.on("child_added", (snap) => {
      loadedChannels.push(snap.val());
      this.setState({ channels: loadedChannels }, () => this.setFirstChannel());
      this.addNotificationListener(snap.key);
    });
  };

  // notification logic starts------------------------------------------------------------------------------------

  addNotificationListener = (channelId) => {
    this.state.messagesRef.child(channelId).on("value", (snap) => {
      if (this.state.channel) {
        this.handleNotifications(
          channelId,
          this.state.channel.id,
          this.state.notifications,
          snap
        );
      }
    });
  };

  handleNotifications = (channelId, currentChannelId, notifications, snap) => {
    let lastTotal = 0;

    let index = notifications.findIndex(
      (notification) => notification.id === channelId
    );

    if (index !== -1) {
      if (channelId !== currentChannelId) {
        lastTotal = notifications[index].total;

        if (snap.numChildren() - lastTotal > 0) {
          notifications[index].count = snap.numChildren() - lastTotal;
        }
      }
      notifications[index].lastKnownTotal = snap.numChildren();
    } else {
      notifications.push({
        id: channelId,
        total: snap.numChildren(),
        lastKnownTotal: snap.numChildren(),
        count: 0,
      });
    }

    this.setState({ notifications });
  };

  clearNotifiations = () => {
    let index = this.state.notifications.findIndex(
      (notification) => notification.id === this.state.channel.id
    );

    if (index !== -1) {
      let updatedNotifications = [...this.state.notifications];
      updatedNotifications[index].total = this.state.notifications[
        index
      ].lastKnownTotal;
      updatedNotifications[index].count = 0;
      this.setState({ notifications: updatedNotifications });
    }
  };

  getNotificationCount = (channel) => {
    let count = 0;

    this.state.notifications.forEach((notification) => {
      if (notification.id === channel.id) {
        count = notification.count;
      }
    });

    if (count > 0) return count;
  };

  // creating channel showing active effect logic----------------------------------------------------------------

  setFirstChannel = () => {
    //for showing active effect on opening app on fist channel
    const firstChannel = this.state.channels[0];
    if (this.state.firstLoad && this.state.channels.length > 0) {
      this.props.setCurrentChannel(firstChannel);
      this.setActiveChannel(firstChannel);
      this.setState({ channel: firstChannel });
    }

    this.setState({ firstLoad: false });
  };

  changeChannel = (channel) => {
    this.setActiveChannel(channel);
    this.state.typingRef
      .child(this.state.channel.id)
      .child(this.state.user.uid)
      .remove();
    this.props.setCurrentChannel(channel);
    this.props.setPrivateChannel(false);
    this.setState({ channel }, () => {
      this.clearNotifiations();
    });
  };

  setActiveChannel = (channel) => {
    this.setState({ activeChannel: channel.id });
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

  // simple utilities-------------------------------------------------------------------------------------------------------

  closeModal = () => {
    this.setState({ modal: false });
  };

  openModal = () => {
    this.setState({ modal: true });
  };

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  isFormvalid = ({ channelName, channelDetails }) =>
    channelDetails && channelName;

  render() {
    const { channels, modal, channelName, channelDetails } = this.state;
    return (
      <>
        <Menu.Menu className="menu">
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
                onClick={() => this.changeChannel(channel)}
                name={channel.name}
                style={{ opacity: 0.7 }}
                active={channel.id === this.state.activeChannel}
              >
                {this.getNotificationCount(channel) && (
                  <Label color="red">
                    {this.getNotificationCount(channel)}
                  </Label>
                )}
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

export default connect(null, { setCurrentChannel, setPrivateChannel })(
  Channels
);
