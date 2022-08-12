import React from "react";
import { COUNTDOWN_INTERVAL } from "../constants"

export default function CountDownTimer(props: { userAction: () => void; }) {
  const [tick, setTick] = React.useState(COUNTDOWN_INTERVAL);

  React.useEffect(() => {
    const timerId = setInterval(() => {
      if (tick === 0) {
        console.log("Entered here");
        props.userAction();
        setTick(COUNTDOWN_INTERVAL);
      } else {
        setTick(tick - 1);
      }
    }, 1000);
    return () => clearInterval(timerId);
  });

  return (
    <h1>{"00:" + tick}</h1>
  )
}
