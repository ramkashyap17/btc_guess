import * as React from "react";
import { Amplify, API, graphqlOperation } from "aws-amplify";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import ForwardIcon from "@mui/icons-material/Forward";
import TextField from "@mui/material/TextField";
import { Button } from "@mui/material";
import { createScore, updateScore } from "../graphql/mutations";
import { listScores } from "../graphql/queries";
import awsExports from "../aws-exports";
import { USERNAME_KEY_LS, UserResponse, UserResult } from "../constants";
import CountDownTimer from "../components/CountDownTimer";

Amplify.configure(awsExports);

const initialState = {
  name: "",
  score: "",
};

export default function GamePage() {
  const [userNameInput, setUserNameInput] = React.useState(initialState.name);
  const [serverUser, setServerUser] = React.useState(null);

  const [userName, setUserName] = React.useState(initialState.name);
  const [userScore, setUserScore] = React.useState(0);
  const [currentBTCValue, setCurrentBTCValue] = React.useState(0);
  const [previousBTCValue, setPreviousBTCValue] = React.useState(0);
  const [result, setResult] = React.useState(UserResult.NONE);
  const [userSelectedValue, setUserSelectedValue] = React.useState(
    UserResponse.NONE
  );
  const [userLoggedIn, setUserLoggedIn] = React.useState(false);

  React.useEffect(() => {
    async function initialize() {
      const user = localStorage.getItem(USERNAME_KEY_LS);
      if (user) {
        const sUser = await fetchScore(user);
        setServerUser(sUser);
        setUserName(sUser.name);
        setUserScore(parseInt(sUser.score));
        setUserLoggedIn(true);
        userAction();
      }
    }
    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startGame() {
    console.log("Triggered 1");
    if (userNameInput.length <= 0) return;
    console.log("Triggered 1");
    const sUser = await addScoreToServer();
    localStorage.setItem("username", sUser.name);
    setServerUser(sUser);
    setUserName(sUser.name);
    setUserScore(parseInt(sUser.score));
    setUserLoggedIn(true);
    userAction();
  }

  function removeUserAndResetApp() {
    localStorage.removeItem(USERNAME_KEY_LS);
    setUserLoggedIn(false);
    setUserNameInput(initialState.name);
  }

  async function fetchScore(user: string) {
    try {
      console.log("This is username: ", user);
      const scoresData: any = await API.graphql(
        graphqlOperation(listScores, {
          filter: {
            name: {
              eq: user,
            },
          },
        })
      );
      const users = scoresData.data.listScores.items;
      if (users && users.length > 0) {
        let sUser = users[0];
        delete sUser["createdAt"];
        delete sUser["updatedAt"];
        return users[0];
      } else {
        removeUserAndResetApp();
      }
      return;
    } catch (err) {
      console.log("error fetching scores", err);
      removeUserAndResetApp();
    }
  }

  async function addScoreToServer() {
    try {
      const score = { name: userNameInput, score: "0" };
      const servUser: any = await API.graphql(
        graphqlOperation(createScore, { input: score })
      );
      if (servUser.data.createScore) {
        let sUser = servUser.data.createScore;
        delete sUser["createdAt"];
        delete sUser["updatedAt"];
        return sUser;
      } else {
        removeUserAndResetApp();
      }
      return;
    } catch (err) {
      console.log("error adding score:", err);
      removeUserAndResetApp();
    }
  }

  async function updateScoreOnServer(score: number) {
    let sUser: any = serverUser;
    if (sUser) sUser.score = score + "";
    try {
      console.log("This is the obj being updated: ", sUser);
      await API.graphql({ query: updateScore, variables: { input: sUser } });
    } catch (e) {
      console.log("Could not update the scores on the server", e);
    }
  }

  const userAction = async () => {
    const response = await fetch(
      "https://api.coindesk.com/v1/bpi/currentprice.json"
    );
    const myJson = await response.json();

    const previousVal =
      previousBTCValue === 0 ? myJson.bpi.USD.rate_float : currentBTCValue;
    const currentVal = myJson.bpi.USD.rate_float;

    if (userSelectedValue && userSelectedValue !== UserResponse.NONE) {
      const resultVal = currentVal - previousVal;
      if (
        (userSelectedValue === UserResponse.UP && resultVal >= 0) ||
        (userSelectedValue === UserResponse.DOWN && resultVal < 0)
      ) {
        await updateScoreOnServer(userScore + 1);
        setUserScore(userScore + 1);
        setResult(UserResult.WIN);
      } else {
        await updateScoreOnServer(userScore - 1);
        setUserScore(userScore - 1);
        setResult(UserResult.LOSS);
      }
    } else {
      setResult(UserResult.NONE);
    }
    setUserSelectedValue(UserResponse.NONE);
    setPreviousBTCValue(previousVal);
    setCurrentBTCValue(currentVal);
  };

  const getResultText = () => {
    if (result === UserResult.WIN) return "You won the last round";
    else if (result === UserResult.LOSS) return "You lost the last round";
    else if (previousBTCValue === 0)
      return "The Game has just started... Make a guess";
    else return "";
  };

  const getUserInputActionLabel = () => {
    if (userSelectedValue === UserResponse.UP)
      return "You've predicted that the value will go up, please wait...";
    else if (userSelectedValue === UserResponse.DOWN)
      return "You've predicted that the value will go down, please wait...";
    else return "";
  };

  if (!userLoggedIn)
    return (
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        justifyContent="center"
        style={{ minHeight: "100vh" }}
      >
        <TextField
          required
          id="outlined-required"
          label="Enter username"
          onChange={(event) => setUserNameInput(event.target.value)}
        />
        <Button
          variant="contained"
          color="success"
          endIcon={<ForwardIcon sx={{ color: "white" }} onClick={startGame} />}
        >
          Start
        </Button>
      </Stack>
    );

  return (
    <Stack
      spacing={1}
      alignItems="center"
      justifyContent="center"
      style={{ minHeight: "100vh" }}
    >
      <h4>{getResultText()}</h4>
      <h4>{"User score is: " + userScore}</h4>
      <h4>{"Previous value was $" + previousBTCValue}</h4>
      {currentBTCValue - previousBTCValue >= 0 ? (
        <IconButton disabled={true} aria-label="up">
          <ArrowUpwardRoundedIcon sx={{ color: "green" }} />
          {"$" + currentBTCValue}
        </IconButton>
      ) : (
        <IconButton disabled={true} aria-label="down">
          <ArrowDownwardRoundedIcon sx={{ color: "red" }} />
          {"$" + currentBTCValue}
        </IconButton>
      )}
      <CountDownTimer userAction={userAction} />
      {userSelectedValue === UserResponse.NONE && (
        <h4>{`${userName}, Take a guess`}</h4>
      )}
      {userSelectedValue === UserResponse.NONE ? (
        <Stack direction="row" spacing={1}>
          <IconButton
            aria-label="up"
            onClick={() => setUserSelectedValue(UserResponse.UP)}
          >
            <ArrowUpwardRoundedIcon sx={{ color: "green" }} />
          </IconButton>
          <IconButton
            aria-label="down"
            onClick={() => setUserSelectedValue(UserResponse.DOWN)}
          >
            <ArrowDownwardRoundedIcon sx={{ color: "red" }} />
          </IconButton>
        </Stack>
      ) : (
        <h4>{getUserInputActionLabel()}</h4>
      )}
    </Stack>
  );
}
