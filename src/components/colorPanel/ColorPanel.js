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
import firebase from "../../firebase";
import { connect } from "react-redux";
import { setColors } from "../../actions/index";

export class ColorPanel extends Component {
  state = {
    modal: false,
    primary: "",
    secondary: "",
    usersRef: firebase.database().ref("users"),
    user: this.props.currentUser,
    userColors: [],
  };

  componentDidMount() {
    if (this.state.user) {
      this.addListener(this.state.user.uid);
    }
  }

  addListener = (userId) => {
    let userColors = [];

    this.state.usersRef
      .child(`${this.state.user.uid}/colors`)
      .on("child_added", (snap) => {
        userColors.unshift(snap.val());
        this.setState({ userColors });
      });
  };

  openModal = () => this.setState({ modal: true });

  closeModal = () => this.setState({ modal: false });

  handleChangePrimary = (color) => this.setState({ primary: color.hex });

  handleChangeSecondary = (color) => this.setState({ secondary: color.hex });

  handleSaveColors = () => {
    if (this.state.primary && this.state.secondary) {
      this.saveColors(this.state.primary, this.state.secondary);
    }
  };

  saveColors = (primary, secondary) => {
    this.state.usersRef
      .child(`${this.state.user.uid}/colors`)
      .push()
      .update({ primary, secondary })
      .then(() => {
        console.log("colors added");
        this.closeModal();
      })
      .catch((err) => console.log(err));
  };

  displayUserColors = (colors) =>
    colors.length > 0 &&
    colors.map((color, i) => (
      <React.Fragment key={i}>
        <Divider />
        <div
          className="color__container"
          onClick={() => this.props.setColors(color.primary, color.secondary)}
        >
          <div className="color__square" style={{ background: color.primary }}>
            <div
              className="color__overlay"
              style={{ background: color.secondary }}
            ></div>
          </div>
        </div>
      </React.Fragment>
    ));

  render() {
    const { modal, primary, secondary, userColors } = this.state;
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
          {this.displayUserColors(userColors)}

          {/* color picker */}
          <Modal basic open={modal} onClose={this.closeModal}>
            <Modal.Header>Choose App Colors</Modal.Header>
            <Modal.Content>
              <Grid divided="vertically" centered columns={2}>
                <Grid.Column>
                  <Segment padded>
                    <Label attached="top" content="Primary Color" />
                    <GithubPicker
                      color={primary}
                      onChange={this.handleChangePrimary}
                    />
                  </Segment>
                </Grid.Column>
                <Grid.Column>
                  <Segment padded>
                    <Label attached="top" content="Secondary Color" />
                    <GithubPicker
                      color={secondary}
                      onChange={this.handleChangeSecondary}
                    />
                  </Segment>
                </Grid.Column>
              </Grid>
            </Modal.Content>
            <Modal.Actions>
              <Button color="green" inverted onClick={this.handleSaveColors}>
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

export default connect(null, { setColors })(ColorPanel);
