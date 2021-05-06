import React, { Component } from "react";
import {
  Grid,
  Header,
  Icon,
  Dropdown,
  Image,
  Modal,
  Input,
  Button,
} from "semantic-ui-react";
import firebase from "../../firebase";
import { connect } from "react-redux";
import AvatarEditor from "react-avatar-editor";

export class UserPanel extends Component {
  state = {
    user: this.props.currentUser,
    modal: false,
    previewImage: "",
    croppedImage: "",
    blob: "",
    storageRef: firebase.storage().ref(),
    usersRef: firebase.auth().currentUser,
    metadata: {
      contentType: "image/jpeg",
    },
    uploadCroppedImage: "",
    userRef: firebase.database().ref("users"),
  };

  // componentDidMount() {
  //   this.setState({
  //     user: this.props.currentUser,
  //   });
  // }

  // or

  // componentwillreceiveprops()

  openModal = () => this.setState({ modal: true });

  closeModal = () => this.setState({ modal: false });

  dropdownOptions = () => [
    {
      key: "user",
      text: (
        <span>
          Signed in as <strong>{this.state.user.displayName}</strong>
        </span>
      ),
      disabled: true,
    },
    {
      key: "avatar",
      text: <span onClick={this.openModal}>Change Avatar</span>,
    },
    {
      key: "signout",
      text: <span onClick={this.handleSignout}>Sign Out</span>,
    },
  ];

  handleSignout = () => {
    firebase
      .auth()
      .signOut()
      .then(() => console.log("signed out!"));
  };

  handleChange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    if (file) {
      reader.readAsDataURL(file);
      reader.addEventListener("load", () => {
        this.setState({ previewImage: reader.result });
      });
    }
  };

  handleCropImage = () => {
    if (this.avatarEditor) {
      this.avatarEditor.getImageScaledToCanvas().toBlob((blob) => {
        let imageUrl = URL.createObjectURL(blob); // for converting cropped image into a source url so that we can just simply put it in src of image tag
        this.setState({
          croppedImage: imageUrl,
          blob,
        });
      });
    }
  };

  uploadCroppedImage = () => {
    const { storageRef, usersRef, metadata, blob } = this.state;
    storageRef
      .child(`avatars/user/${usersRef.uid}`)
      .put(blob, metadata)
      .then((snap) => {
        snap.ref.getDownloadURL().then((getDownloadURL) => {
          this.setState({ uploadCroppedImage: getDownloadURL }, () => {
            this.changeAvatar();
          });
        });
      });
  };

  changeAvatar = () => {
    this.state.usersRef
      .updateProfile({
        photoURL: this.state.uploadCroppedImage,
      })
      .then(() => {
        console.log("PhotoURL upated");
        this.closeModal();
      })
      .catch((err) => {
        console.log(err);
      });

    this.state.userRef
      .child(this.state.user.uid)
      .update({ avatar: this.state.uploadCroppedImage })
      .then(() => {
        console.log("User avatar updated");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  render() {
    const { user, modal, previewImage, croppedImage } = this.state;
    const { primaryColor } = this.props;
    return (
      <Grid style={{ backgorund: primaryColor }}>
        <Grid.Column>
          <Grid.Row style={{ padding: "1.2em", margin: 0 }}>
            <Header inverted floated="left" as="h2">
              <Icon name="code" />
              <Header.Content>DevChat</Header.Content>
            </Header>
          </Grid.Row>
          <Header style={{ padding: "1rem" }} as="h4" inverted>
            <Dropdown
              trigger={
                <span>
                  <Image src={user.photoURL} spaced="right" avatar />
                  {this.state.user.displayName}
                </span>
              }
              options={this.dropdownOptions()}
            />
          </Header>
        </Grid.Column>

        <Modal basic open={modal} onClose={this.closeModal}>
          <Modal.Header>Change Avatars</Modal.Header>
          <Modal.Content>
            <Input
              fluid
              type="file"
              label="New Avatar"
              name="previewImage"
              onChange={this.handleChange}
            />
            <Grid centered stackable columns={2}>
              <Grid.Row centered>
                <Grid.Column className="ui center aligned grid">
                  {previewImage && (
                    <AvatarEditor
                      ref={(node) => (this.avatarEditor = node)}
                      image={previewImage}
                      width={120}
                      height={120}
                      border={50}
                      scale={1.2}
                    />
                  )}
                </Grid.Column>
                <Grid.Column>
                  {croppedImage && (
                    <Image
                      style={{ margin: "3.5em auto" }}
                      width={100}
                      height={100}
                      src={croppedImage}
                    />
                  )}
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Modal.Content>
          <Modal.Actions>
            {croppedImage && (
              <Button color="green" inverted onClick={this.uploadCroppedImage}>
                <Icon name="save" /> Change Avatar
              </Button>
            )}
            <Button color="green" inverted onClick={this.handleCropImage}>
              <Icon name="image" /> Preview
            </Button>
            <Button color="red" inverted onClick={this.closeModal}>
              <Icon name="remove" /> Cancel
            </Button>
          </Modal.Actions>
        </Modal>
      </Grid>
    );
  }
}

export default UserPanel;
