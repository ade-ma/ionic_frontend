#ADE-MA UI-Client

To run on a computer all you need:

    npm install -g cordova ionic

To launch:

    ionic serve
    
To compile for native is a multi-step process
- make sure android sdk is installed
- install ant
- add to .bashrc

        export ANDROID_HOME=/home/[username]/Android/Sdk
        export PATH=$ANDROID_HOME/tools:$PATH
        export PATH=$ANDROID_HOME/platform-tools:$PATH

- execute the following commands

        ionic platform add android
        ionic build android

- to run on a device simply connect android phone and execute `ionic run android` 
        
