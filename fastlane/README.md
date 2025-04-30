fastlane documentation
----

# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```sh
xcode-select --install
```

For _fastlane_ installation instructions, see [Installing _fastlane_](https://docs.fastlane.tools/#installing-fastlane)

# Available Actions

## Android

### android increment_version

```sh
[bundle exec] fastlane android increment_version
```

Auto-increment Android versionName and versionCode

### android build

```sh
[bundle exec] fastlane android build
```

Build the APK

### android upload

```sh
[bundle exec] fastlane android upload
```

Upload the APK to Firebase App Distribution.

### android deploy

```sh
[bundle exec] fastlane android deploy
```

Deploy the APK to Firebase App Distribution.

----


## iOS

### ios build

```sh
[bundle exec] fastlane ios build
```

Build the IPA

### ios upload

```sh
[bundle exec] fastlane ios upload
```

Upload the IPA to Firebase App Distribution.

### ios deploy

```sh
[bundle exec] fastlane ios deploy
```

Deploy the IPA to Firebase App Distribution.

----

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.

More information about _fastlane_ can be found on [fastlane.tools](https://fastlane.tools).

The documentation of _fastlane_ can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
