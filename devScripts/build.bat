cd ..
cd android
gradlew.bat assembleRelease
set /p tmp="Connect phone and Press enter to proceed..."
adb install app\build\outputs\apk\release\app-release.apk
