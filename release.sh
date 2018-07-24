#!/bin/sh

set -ex

if [ $# = 1 ]
then
    if [ $1 = "dev" ]
    then
        git checkout develop
        cd android
        ./gradlew assembleRelease
        cp app/build/outputs/apk/app-release.apk ../Lotus-dev.apk
        cd ..
#        scp app-release.apk root@nisdos.com:/storage/lotus-dev.apk
    elif [ $1 = "prod" ]
    then
        git checkout master
        cd android
        ./gradlew assembleRelease
        cp app/build/outputs/apk/app-release.apk ../Lotus.apk
        cd ..
#        scp app-release.apk root@nisdos.com:/storage/lotus-prod.apk
    else
        echo "Extra command not recognized"
    fi
fi
