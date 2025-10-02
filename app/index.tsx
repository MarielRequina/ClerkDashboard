import { Platform, Text, View, Image, TouchableOpacity } from "react-native";
import colors from "../shared/color";
import { useCallback, useEffect } from "react";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { useSSO, useUser, useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";

// Preload browser for smoother login
export const useWarmUpBrowser = () => {
  useEffect(() => {
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

WebBrowser.maybeCompleteAuthSession();

export default function Index() {
  const { isSignedIn } = useAuth();
  const { user, isLoaded } = useUser(); // 👈 now with isLoaded
  const router = useRouter();
  useWarmUpBrowser();

  // Watch for user login
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      console.log("User object:", JSON.stringify(user, null, 2));
      console.log("User email:", user.primaryEmailAddress?.emailAddress);
    }
  }, [isLoaded, isSignedIn, user]);

  // SSO login flow
  const { startSSOFlow } = useSSO();
  const onPress = useCallback(async () => {
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_google",
        redirectUrl: AuthSession.makeRedirectUri(),
      });

      if (createdSessionId) {
        await setActive?.({
          session: createdSessionId,
          navigate: async () => {
            // Navigate after successful login
            router.push("/");
          },
        });
      } else {
        console.warn("No session created, check MFA or missing requirements.");
      }
    } catch (err) {
      console.error("Login error:", JSON.stringify(err, null, 2));
    }
  }, [startSSOFlow, router]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingTop: Platform.OS === "android" ? 40 : 30,
      }}
    >
      <Image
        source={require("./../assets/images/image.png")}
        style={{ width: 200, height: 200, borderRadius: 100, marginBottom: 20 }}
      />
      <Text>Am I Kawaii?</Text>

      <View>
        <Text
          style={{
            fontStyle: "italic",
            textAlign: "center",
            fontWeight: "bold",
            marginTop: 20,
            color: colors.primary,
          }}
        >
          OHAYOOO!
        </Text>
      </View>

      <TouchableOpacity
        style={{
          marginTop: 20,
          width: "25%",
          padding: 15,
          backgroundColor: colors.background,
          borderRadius: 5,
        }}
        onPress={onPress}
      >
        <Text style={{ textAlign: "center" }}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}
