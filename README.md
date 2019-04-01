# Android-Trackpad

This is the source code behind Android-Trackpad

## Setting up development environment

There are two components to build, the mobile app and the server side
which will drive the mouse.

All of these steps assume you've `cd`'d into the cloned project directory

Requirements:
  * python 3.6+
  * virtualenv
  * npm
  * expo-cli

Update npm and get expo:

    sudo npm i npm@latest -g
    sudo npm install -g expo-cli

Create a virtual environment for the server-side and install requirements

    virtualenv --python=python3 venv
    pip install -r requirements.txt

Get mobile app dependencies

    npm install

If running on a physical mobile device, install expo

[Download for Android from the Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
or [for iOS from the App Store](https://itunes.com/apps/exponent)

If using an emulator/simulator, the CLI will manage this for you

## Running

Launch the python server in one terminal, and launch expo in another.
Changes to the python side will require a restart of the server.
Expo has hot-reload so just saving the edited source code file will
build and deploy the change to the mobile device.

The terminal where the server runs needs to have the virtual environment
activated once. When you close that terminal and open a new one, you'll
need to reactivate it with:

    source venv/bin/activate

For starting the services:

    python android-trackpad-server.py
    npm start



## Caveats

There is no IP auto-detection currently, so you need to manually change
the IP address the client is using to contact the server. It's in the `url`
property of the `WS` component of `Trackpad.js` (near the bottom)
