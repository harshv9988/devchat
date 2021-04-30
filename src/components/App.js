import React from "react";
import "./App.css";

import { connect } from "react-redux";

import { Grid } from "semantic-ui-react";

import ColorPanel from "./colorPanel/ColorPanel";
import SidePanel from "./sidePanel/SidePanel";
import Messages from "./messages/Messages";
import MetaPanel from "./metaPanel/MetaPanel";

const App = ({ currentUser, currentChannel, isPrivateChannel }) => {
  return (
    <Grid columns="equal" className="app" style={{ background: "#eee" }}>
      <ColorPanel />
      <SidePanel currentUser={currentUser} key={currentUser.id} />
      <Grid.Column style={{ marginLeft: 320 }}>
        <Messages
          currentChannel={currentChannel}
          key={currentChannel && currentChannel.id}
          currentUser={currentUser}
          isPrivateChannel={isPrivateChannel}
        />
      </Grid.Column>
      <Grid.Column width={4}>
        <MetaPanel />
      </Grid.Column>
    </Grid>
  );
};

const mapStateToProps = (state) => ({
  currentUser: state.user.currentUser,
  currentChannel: state.channel.currentChannel,
  isPrivateChannel: state.channel.isPrivateChannel,
});

export default connect(mapStateToProps)(App);
