---
title: "Hybrid native apps: setup Expo + React Native to wrap a web app"
date: 2023-05-14
author: Oscar Newman
description: "Tips, tricks, and techniques I've learned to run a native app (that wraps your website) via your Remix codebase, with high interactivity and smooth transitions, and without giving up Remix's data loading and mutations on the server."
published: false
---

_This is based on and an extension of
[my talk at Remix Conf 2023](https://www.youtube.com/live/wobP9yhrmhQ?feature=share&t=20019).
After the talk, a lot of people seemed interested in the specific steps and
setup to wrap your web app in Expo and make it feel native, so this article is
my attempt to document that process._

The tl;dr of the talk is:

1. Sometimes you don't have the capacity to maintain a native and web app, so
   you ship your website wrapped in a native shell as your mobile app.
2. Remix is a pretty good tool for this (from the web perspective)
3. Expo is the best native toolkit I've found to do this (I didn't have as much
   success with Capacitor)

## Let's setup Expo

```bash
npx create-expo-app expo-demo
```

```bash
npm run ios
```

```bash
npm i react-native-webview
```

```jsx showLineNumbers
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
```

```jsx showLineNumbers {3,8,14-20}
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";

export default function App() {
  return (
    <View style={styles.container}>
      <WebView style={styles.webView} />
      <StatusBar style="auto" />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webView: {
    width: "100%",
    height: "100%",
  },
});
```

```jsx showLineNumbers {2,3,9-18}
export default function App() {
  const webRef = useRef(null);
  const reload = () => webRef.current?.reload();

  return (
    <View style={styles.container}>
      <WebView
        style={styles.webView}
        source={{
          uri: "http://localhost:3000",
        }}
        decelerationRate="normal"
        allowsBackForwardNavigationGestures
        automaticallyAdjustsScrollIndicatorInsets
        androidLayerType="hardware"
        ref={webRef}
        onRenderProcessGone={reload}
        onContentProcessDidTerminate={reload}
      />
      <StatusBar style="auto" />
    </View>
  );
}
```

Let's go over what each of these props do:

- `decelerationRate="normal"{:jsx}`: This makes the scrolling feel more natural
- `allowsBackForwardNavigationGestures{:jsx}`: This allows you to swipe left and
  right to go back and forward in the webview
- `automaticallyAdjustsScrollIndicatorInsets{:jsx}`: This makes the scrollbars
  disappear when you're not scrolling
- `androidLayerType="hardware"{:jsx}`: This makes the webview use the GPU to render
  the webview, which makes it much smoother
- `ref={webRef}{:jsx}`: This allows us to reload the webview when it crashes
- `onRenderProcessGone={reload}{:jsx}`: This reloads the webview when it crashes
- `onContentProcessDidTerminate={reload}{:jsx}`: This reloads the webview when it
  crashes

```tsx showLineNumbers
<WebView
  pullToRefreshEnabled={true}
  androidLayerType="hardware"
  decelerationRate="normal"
  allowsBackForwardNavigationGestures
  injectedJavaScript={injectedJavascript}
  onMessage={messageHandlers}
  renderLoading={() => null}
  source={{ uri }}
  onRenderProcessGone={() => webRef.current?.reload()}
  userAgent={customUAString}
  onContentProcessDidTerminate={() => webRef.current?.reload()}
/>
```
