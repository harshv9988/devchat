import React, { Component } from "react";
import { Segment, Comment, Message } from "semantic-ui-react";
import MessagesHeader from "./MessagesHeader";
import MessageForm from "./MessageForm";

export class Messages extends Component {
  render() {
    return (
      <>
        <MessagesHeader />

        <Segment>
          <Comment.Group className="messages">{/* messages */}</Comment.Group>
        </Segment>

        <MessageForm />
      </>
    );
  }
}

export default Messages;
