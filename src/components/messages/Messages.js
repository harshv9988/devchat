import React, { Component } from "react";
import { Segment, Comment } from "semantic-ui-react";
import MessagesHeader from "./MessagesHeader";
import MessageForm from "./MessageForm";
import firebase from "../../firebase";
import Message from "./Message";

export class Messages extends Component {
  state = {
    messagesRef: firebase.database().ref("messages"),
    channel: this.props.currentChannel,
    user: this.props.currentUser,
    messages: [],
    messagesLoading: true,
  };

  componentDidMount() {
    const { channel, user } = this.state;

    if (channel && user) {
      this.addListeners(channel.id);
    }
  }

  addListeners = (channelID) => {
    this.addMessageListener(channelID);
  };

  addMessageListener = (channelID) => {
    let loadedMessages = [];
    this.state.messagesRef.child(channelID).on("child_added", (snap) => {
      loadedMessages.push(snap.val());
      this.setState({
        messages: loadedMessages,
        messagesLoading: false,
      });
    });
  };

  render() {
    const { messagesRef, channel, user, messages } = this.state;
    return (
      <>
        <MessagesHeader />

        <Segment style={{ height: 500 }}>
          <Comment.Group className="messages" style={{ height: "100%" }}>
            {messages.length > 0 &&
              messages.map((message) => (
                <Message
                  key={message.timestamp}
                  message={message}
                  user={this.state.user}
                />
              ))}
          </Comment.Group>
        </Segment>

        <MessageForm
          messagesRef={messagesRef}
          currentChannel={channel}
          currentUser={user}
        />
      </>
    );
  }
}

export default Messages;
