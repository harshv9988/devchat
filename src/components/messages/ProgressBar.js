import React from "react";
import { Progress } from "semantic-ui-react";

const ProgressBar = ({ uploadState, percentUpload }) =>
  uploadState === "uploading" && (
    <Progress
      className="progress__bar"
      percent={percentUpload}
      progress
      indication
      size="medium"
      inverted
      color="purple"
    />
  );

export default ProgressBar;
