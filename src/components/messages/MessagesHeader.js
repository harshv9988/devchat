import React, { Component } from "react";
import { Header, Segment, Input, Icon } from "semantic-ui-react";

export class MessagesHeader extends Component {
  render() {
    const {
      channelName,
      numUniqueUsers,
      handleSearchChange,
      searchLoading,
      isPrivateChannel,
      handleStar,
      isChannelStarred,
    } = this.props;
    return (
      <Segment clearing>
        {/* channel title */}
        <Header fluid="true" as="h2" floated="left" style={{ marginBottom: 0 }}>
          <span>
            {channelName}
            {!isPrivateChannel && (
              <Icon
                name={isChannelStarred ? "star" : "star outline"}
                color={isChannelStarred ? "yellow" : "black"}
                onClick={handleStar}
                style={{ cursor: "pointer" }}
              />
            )}
          </span>
          <Header.Subheader>{numUniqueUsers}</Header.Subheader>
          {/* Channel search input */}
        </Header>
        <Header floated="right">
          <Input
            loading={searchLoading}
            size="mini"
            icon="search"
            name="searchTerm"
            placeholder="Search Messages"
            onChange={handleSearchChange}
          />
        </Header>
      </Segment>
    );
  }
}

export default MessagesHeader;
