#!/usr/bin/env bash
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk
export PATH="$JAVA_HOME/bin:$PATH"

(cd android && ./gradlew --stop) 2>/dev/null   # drop any daemon started on the wrong JDK
java -version
npx expo run:android "$@"