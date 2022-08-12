# BTC Guess app

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

This app has been built with AWS Amplify and AWS AppSync to manage datastore operations. 

This app has been deployed on AWS EC2 in [here](http://13.250.172.207/) served via nginx. 

## Available Scripts

In the project directory, you can run:

### `npm i`
### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Algorithm

<ul>
  <li>Step 0: create a timer that resets every 60 seconds</li>
  <li>Step 1: Take user input if it will go up or down</li>
  <li>Step 2: Read data from coin desk when user starts the game and everytime the timer resets. Difference between them says if the price went up or down. </li>
  <li>Step 3: store userscore on a simple server db with client session maintained on localstorage</li>
</ul>

## Stack

Create react app with typescript
AWS: Amplify, AppSync, EC2, 
API: GraphQL
DB: DynamoDB, localstorage
### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

