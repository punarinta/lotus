#!/bin/sh

cd android
rm app/build/outputs/apk/release/app-release.apk
./gradlew assembleRelease
cp app/build/outputs/apk/release/app-release.apk ../Lotus.apk
cd ..
scp Lotus.apk root@getakla.com:/sites/nisdos.com/nightly/Lotus.apk
