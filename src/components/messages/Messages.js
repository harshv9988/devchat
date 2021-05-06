import React, { Component } from "react";
import { Segment, Comment } from "semantic-ui-react";
import MessagesHeader from "./MessagesHeader";
import MessageForm from "./MessageForm";
import firebase from "../../firebase";
import Message from "./Message";
import { connect } from "react-redux";
import { setUserPosts } from "../../actions/index";
import Typing from "./Typing";
import Skeleton from "./Skeleton";

export class Messages extends Component {
  state = {
    privateChannel: this.props.isPrivateChannel,
    messagesRef: firebase.database().ref("messages"),
    privateMessagesRef: firebase.database().ref("privateMessages"),
    channel: this.props.currentChannel,
    user: this.props.currentUser,
    messages: [],
    messagesLoading: true,
    numUniqueUsers: "",
    searchTerm: "",
    searchLoading: false,
    searchResults: [],
    isChannelStarred: false,
    usersRef: firebase.database().ref("users"),
    typingRef: firebase.database().ref("typing"),
    typingUsers: [],
    connectedRef: firebase.database().ref(".info/connected"),
    listeners: [],
  };

  componentDidMount() {
    const { channel, user, listeners } = this.state;

    if (channel && user) {
      this.removeListeners(listeners); //why here?
      this.addListeners(channel.id);
      this.addUsersStarsListener(channel.id, user.uid);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.messagesEnd) {
      this.scrollToBottom();
    }
  }

  componentWillUnmount() {
    this.removeListeners(this.state.listeners);
    this.state.connectedRef.off();
  }

  removeListeners = (listeners) => {
    listeners.forEach((listener) => {
      listener.ref.child(listener.id).off(listener.event);
    });
  };

  addToListeners = (id, ref, event) => {
    const index = this.state.listeners.findIndex((listener) => {
      return (
        listener.id === id && listener.ref === ref && listener.event === event
      );
    });

    if (index === -1) {
      const newListener = { id, ref, event };
      this.setState({ listeners: this.state.listeners.concat(newListener) });
    }
  };

  scrollToBottom = () => {
    this.messagesEnd.scrollIntoView({ behavior: "smooth" });
  };

  // search logic----------------------------------------------------------------

  handleSearchChange = (event) => {
    this.setState(
      {
        searchTerm: event.target.value,
        searchLoading: true,
      },
      () => this.handleSearchMessages()
    );
  };

  handleSearchMessages = () => {
    const channelMessages = [...this.state.messages];
    const regex = new RegExp(this.state.searchTerm, "gi");

    const searchResults = channelMessages.reduce((acc, message) => {
      if (
        (message.content && message.content.match(regex)) ||
        message.user.name.match(regex)
      ) {
        acc.push(message);
      }
      return acc;
    }, []);

    this.setState({
      searchResults,
    });

    setTimeout(() => this.setState({ searchLoading: false }), 1000);
  };

  // typing effect logic --------------------------------------------------------------------------------

  addListeners = (channelID) => {
    this.addMessageListener(channelID);
    this.addTypingListeners(channelID);
  };

  addTypingListeners = (channelId) => {
    let typingUsers = [];
    this.state.typingRef.child(channelId).on("child_added", (snap) => {
      console.log("first");
      if (snap.key !== this.state.user.uid) {
        console.log("sec");
        typingUsers = typingUsers.concat({
          id: snap.key,
          name: snap.val(),
        });
        this.setState({ typingUsers }, () => {
          console.log("typing", typingUsers);
        });
      }
    });

    this.addToListeners(channelId, this.state.typingRef, "child_added");

    this.state.typingRef.child(channelId).on("child_removed", (snap) => {
      const index = typingUsers.findIndex((user) => user.id === snap.key);
      if (index !== -1) {
        typingUsers = typingUsers.filter((user) => user.id !== snap.key);
        this.setState({ typingUsers });
      }
    });

    this.addToListeners(channelId, this.state.typingRef, "child_removed");

    this.state.connectedRef.on("value", (snap) => {
      if (snap.val() === true) {
        this.state.typingRef
          .child(channelId)
          .child(this.state.user.uid)
          .onDisconnect()
          .remove((err) => {
            if (err !== null) {
              console.error(err);
            }
          });
      }
    });
  };

  displayTypingUsers = (users) =>
    users.length > 0 &&
    users.map((user) => (
      <div
        style={{
          display: "flex",
          alignItems: "enter",
          marginBottom: "0.2em",
        }}
        key={user.uid}
      >
        <span className="user__typing">{user.name} is typing</span>
        <Typing />
      </div>
    ));

  // messages logic------------------------------------------------------------------------------------

  addMessageListener = (channelID) => {
    let loadedMessages = [];
    const tempRef = this.getMessagesRef();
    tempRef.child(channelID).on("child_added", (snap) => {
      loadedMessages.push(snap.val());
      this.setState({
        messages: loadedMessages,
        messagesLoading: false,
      });
      this.countUniqueUsers(loadedMessages); //for message header
      this.countUserPosts(loadedMessages);
    });

    setTimeout(() => {
      this.setState({ messagesLoading: false });
    }, 3000);

    this.addToListeners(channelID, tempRef, "child_added");
  };

  // message header info-------------------------------------------------------------------------------

  countUniqueUsers = (messages) => {
    const uniqueUsers = messages.reduce((acc, message) => {
      if (!acc.includes(message.user.name)) {
        acc.push(message.user.name);
      }
      return acc;
    }, []);

    if (uniqueUsers.length > 1) {
      const numUniqueUsers = `${uniqueUsers.length} users`;
      this.setState({ numUniqueUsers });
    } else {
      const numUniqueUsers = `${uniqueUsers.length} user`;
      this.setState({ numUniqueUsers });
    }
  };

  countUserPosts = (messages) => {
    let userPosts = messages.reduce((acc, message) => {
      if (message.user.name in acc) {
        acc[message.user.name].count += 1;
      } else {
        acc[message.user.name] = {
          avatar: message.user.avatar,
          count: 1,
        };
      }
      return acc;
    }, {});

    this.props.setUserPosts(userPosts);
  };

  displayChannelName = (channel) => {
    return channel
      ? `${this.state.privateChannel ? "@" : "#"}${channel.name}`
      : "";
  };

  // starred channel logic------------------------------------------------------------------------------

  addUsersStarsListener = (channelId, userId) => {
    this.state.usersRef
      .child(userId)
      .child("starred")
      .once("value")
      .then((data) => {
        if (data.val() !== null) {
          const channelIds = Object.keys(data.val());
          const prevStarred = channelIds.includes(channelId);
          this.setState({ isChannelStarred: prevStarred });
        }
      });
  };

  handleStar = () => {
    this.setState(
      (prevState) => ({
        isChannelStarred: !prevState.isChannelStarred,
      }),
      () => this.starChannel()
    );
  };

  starChannel = () => {
    if (this.state.isChannelStarred) {
      this.state.usersRef.child(`${this.state.user.uid}/starred`).update({
        [this.state.channel.id]: {
          name: this.state.channel.name,
          details: this.state.channel.details,
          createdBy: {
            name: this.state.channel.createdBy.name,
            avatar: this.state.channel.createdBy.avatar,
          },
        },
      });
    } else {
      this.state.usersRef
        .child(`${this.state.user.uid}/starred`)
        .child(this.state.channel.id)
        .remove((err) => {
          if (err != null) {
            console.log(err);
          }
        });
    }
  };

  // simple utilities----------------------------------------------------------------

  getMessagesRef = () => {
    const { messagesRef, privateMessagesRef, privateChannel } = this.state;
    return privateChannel ? privateMessagesRef : messagesRef;
  };

  displayMessagesSkeleton = (loading) =>
    loading ? (
      <>
        {[...Array(9)].map((_, i) => (
          <Skeleton key={i} />
        ))}
      </>
    ) : null;

  render() {
    const {
      messagesRef,
      channel,
      user,
      messages,
      numUniqueUsers,
      searchResults,
      searchTerm,
      searchLoading,
      privateChannel,
      isChannelStarred,
      typingUsers,
      messagesLoading,
    } = this.state;
    return (
      <>
        <MessagesHeader
          channelName={this.displayChannelName(channel)}
          numUniqueUsers={numUniqueUsers}
          handleSearchChange={this.handleSearchChange}
          searchLoading={searchLoading}
          isPrivateChannel={privateChannel}
          handleStar={this.handleStar}
          isChannelStarred={isChannelStarred}
        />

        <Segment style={{ height: 500 }}>
          <Comment.Group className="messages" style={{ height: "100%" }}>
            {this.displayMessagesSkeleton(messagesLoading)}
            {searchTerm
              ? searchResults.length > 0 &&
                searchResults.map((message) => (
                  <Message
                    key={message.timestamp}
                    message={message}
                    user={this.state.user}
                  />
                ))
              : messages.length > 0 &&
                messages.map((message) => (
                  <Message
                    key={message.timestamp}
                    message={message}
                    user={this.state.user}
                  />
                ))}
            {this.displayTypingUsers(typingUsers)}

            <div ref={(node) => (this.messagesEnd = node)}></div>
          </Comment.Group>
        </Segment>

        <MessageForm
          messagesRef={messagesRef}
          currentChannel={channel}
          currentUser={user}
          isPrivateChannel={privateChannel}
          getMessagesRef={this.getMessagesRef}
        />
      </>
    );
  }
}

export default connect(null, { setUserPosts })(Messages);
