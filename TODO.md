# APK Build Complete

Debug APK generated at: android/app/build/outputs/apk/debug/app-debug.apk

Release build failed (NewArch codegen errors).

**Next for release APK:**
- Remove `newArchEnabled=true/false` from gradle.properties
- Update deps (e.g., @react-native-community/geolocation to ^5+)
- Run `npx react-native codegen` before build.

**Install command:** `adb install android/app/build/outputs/apk/debug/app-debug.apk`

