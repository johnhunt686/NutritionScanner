cd ..
cd android
./gradlew assembleRelease
read -p "Connect phone and Press enter to proceed..."
adb install app/build/outputs/apk/release/app-release.apk
