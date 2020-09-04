import React from "react";
import * as ms from "mediasoup-client";
import { RTCManager } from "../rtc/rtc.manager";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import TvIcon from "@material-ui/icons/Tv";
import VideocamIcon from "@material-ui/icons/Videocam";

interface BroadcasterProps {
  rtcManager: RTCManager;
  onStart?: (id: string) => any;
}

interface BroadcasterState {
  mediaDialogOpened: boolean;
}

export class Broadcaster extends React.Component<
  BroadcasterProps,
  BroadcasterState
> {
  producer: ms.types.Producer;

  constructor(props: Readonly<BroadcasterProps>) {
    super(props);

    this.state = {
      mediaDialogOpened: true,
    };
  }

  componentWillUnmount() {
    if (this.producer) this.producer.close();
  }

  async startStream(option: "CAMERA" | "SCREEN") {
    console.log("Starting camera stream");

    this.setState({ mediaDialogOpened: false });

    const producer = await this.props.rtcManager.startProducing(
      await this.getMediaTrack(option)
    );

    if (this.props.onStart) this.props.onStart(producer.id);
  }

  async onStatsClick() {
    const stats = await this.props.rtcManager.getStats();
    console.log(stats);
  }

  async getMediaTrack(option: "CAMERA" | "SCREEN"): Promise<MediaStreamTrack> {
    switch (option) {
      case "CAMERA":
        return (
          await navigator.mediaDevices.getUserMedia({
            video: {},
          })
        ).getVideoTracks()[0];
      case "SCREEN":
        return (
          await (navigator.mediaDevices as any).getDisplayMedia()
        ).getVideoTracks()[0];
    }
  }

  render() {
    return (
      <>
        {/* <h1>Broadcaster</h1> */}
        <Dialog
          aria-labelledby="media-dialog-title"
          open={this.state.mediaDialogOpened}
        >
          <DialogTitle id="media-dialog-title">Choose media source</DialogTitle>
          <List>
            <ListItem button onClick={() => this.startStream("SCREEN")}>
              <ListItemAvatar>
                <Avatar>
                  <TvIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={"Screen"} />
            </ListItem>
            <ListItem button onClick={() => this.startStream("CAMERA")}>
              <ListItemAvatar>
                <Avatar>
                  <VideocamIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={"Camera"} />
            </ListItem>
          </List>
        </Dialog>
        {/* <button onClick={this.startStream.bind(this)}>
          Start broadcasting
        </button> */}
        {/* <button onClick={this.onStatsClick.bind(this)}>stats</button> */}
      </>
    );
  }
}
