# Android-Trackpad

This is the source code behind Android-Trackpad

## Setting up development environment

There are two components to build, the mobile app and the server side
which will drive the mouse.

All of these steps assume you've `cd`'d into the cloned project directory

Requirements:
  * python 3.7
  * virtualenv
  * npm
  * watchman
  * react-native-cli

Follow the [React native CLI Quickstart](http://facebook.github.io/react-native/docs/getting-started.html)
steps to get an emulator and react-native-cli. You only need to go as far
as setting up Watchman.

Create a virtual environment for the server-side and install requirements

    cd server
    virtualenv --python=python3.7 venv
    pip install -r requirements.txt

Get mobile app dependencies

    cd app
    npm install

## Running

Launch the python server in one terminal, and launch react-native in another.
Changes to the python side will require a restart of the server.
React-native has hot-reload so just saving the edited source code file will
build and deploy the change to the mobile device.

The terminal where the server runs needs to have the virtual environment
activated once. When you close that terminal and open a new one, you'll
need to reactivate it with:

For starting the server:

    cd server
    source venv/bin/activate
    python android-trackpad-server.py


For starting the app:

    cd app
    react-native run-android


Capturing logs:
    react-native log-android