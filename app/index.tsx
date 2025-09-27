import { Platform, Text, View, Image, Dimensions, TouchableOpacity } from "react-native";
import colors from "../shared/color";
import {useCallback, useEffect} from "react";
import * as WebBrowser from 'expo-web-browser'
import * as AuthSession from 'expo-auth-session'
import { useSSO } from '@clerk/clerk-expo'
import {useAuth} from "@clerk/clerk-expo";
import { router } from "expo-router";

export const useWarmUpBrowser = () => {
  useEffect(() => {
    // Preloads the browser for Android devices to reduce authentication load time
    // See: https://docs.expo.dev/guides/authentication/#improving-user-experience
    void WebBrowser.warmUpAsync()
    return () => {
      // Cleanup: closes browser when component unmounts
      void WebBrowser.coolDownAsync()
    }
  }, [])
}

// Handle any pending authentication sessions
WebBrowser.maybeCompleteAuthSession()


export default function Index() {

const { isSignedIn } = useAuth()
useEffect(() =>{
  if (isSignedIn) {

  }
}, [isSignedIn]
)

useWarmUpBrowser()

  // Use the useSSO() hook to access the startSSOFlow() method
  const { startSSOFlow } = useSSO()

  const onPress = useCallback(async () => {
    try {
      // Start the authentication process by calling startSSOFlow()
      const { createdSessionId, setActive, signIn, signUp } = await startSSOFlow({
        strategy: 'oauth_google',
        // For web, defaults to current path
        // For native, you must pass a scheme, like AuthSession.makeRedirectUri({ scheme, path })
        // For more info, see https://docs.expo.dev/versions/latest/sdk/auth-session/#authsessionmakeredirecturioptions
        redirectUrl: AuthSession.makeRedirectUri(),
      })

      // If sign in was successful, set the active session
      if (createdSessionId) {
        setActive!({
          session: createdSessionId,
          navigate: async ({ session }) => {
            if (session?.currentTask) {
              // Check for tasks and navigate to custom UI to help users resolve them
              // See https://clerk.com/docs/custom-flows/overview#session-tasks
              console.log(session?.currentTask)
              return
            }

            router.push('/')
          },
        })
      } else {
        // If there is no createdSessionId,
        // there are missing requirements, such as MFA
        // Use the signIn or signUp returned from startSSOFlow
        // to handle next steps
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
    }
  }, [])
  
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingTop: Platform.OS == "android" ? 40: 30,
      }}
    >
      <Image source = {require("./../assets/images/image.png")}
        style={{ width: 200, height: 200, borderRadius: 100, marginBottom: 20 }}
      
        />
        <Text> Am I Kawaii?</Text>
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

          <TouchableOpacity style = {{
            marginTop: 20,
            width: "25%",
            padding: 15,
            backgroundColor:colors.background,
            borderRadius: 5,
          }}>
            <Text style = {{
              textAlign:"center",
            }}>
              Get Started
            </Text>
          </TouchableOpacity>
       
        </View>
  
    );
  }