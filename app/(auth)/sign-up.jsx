import { useState, useEffect, useRef } from "react";
import { Text, TextInput, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { useSignUp, useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { styles } from "@/assets/styles/auth.styles.js";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../constants/colors";
import { Image } from "expo-image";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { API_URL } from "../../constants/api";

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { getToken } = useAuth();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [checkingUsername, setCheckingUsername] = useState(false);
  const usernameTimeoutRef = useRef(null);

  // Debounced username check
  useEffect(() => {
    if (usernameTimeoutRef.current) {
      clearTimeout(usernameTimeoutRef.current);
    }

    if (username && username.trim().length >= 3) {
      usernameTimeoutRef.current = setTimeout(() => {
        checkUsernameAvailability(username);
      }, 500); // 500ms delay
    } else if (username && username.trim().length > 0 && username.trim().length < 3) {
      setUsernameError("Username must be at least 3 characters");
    } else {
      setUsernameError("");
    }

    return () => {
      if (usernameTimeoutRef.current) {
        clearTimeout(usernameTimeoutRef.current);
      }
    };
  }, [username]);

  // Check if username is available
  const checkUsernameAvailability = async (usernameToCheck) => {
    if (!usernameToCheck || usernameToCheck.trim() === '') {
      setUsernameError("");
      return true;
    }

    setCheckingUsername(true);
    setUsernameError("");

    try {
      const response = await fetch(`${API_URL}/users/check-username`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: usernameToCheck.trim() }),
      });

      let result;
      try {
        const responseText = await response.text();
        
        // Check if response is HTML (likely an error page)
        if (responseText.trim().startsWith('<')) {
          console.log('Received HTML response for username check');
          setUsernameError('Service temporarily unavailable');
          return false;
        } else {
          result = JSON.parse(responseText);
        }
      } catch (parseError) {
        console.error('Could not parse username check response:', parseError);
        setUsernameError('Error checking username availability');
        return false;
      }

      if (response.ok) {
        if (result.available) {
          setUsernameError("");
          return true;
        } else {
          setUsernameError("Username is already taken");
          return false;
        }
      } else {
        setUsernameError("Error checking username availability");
        return false;
      }
    } catch (error) {
      console.error('Error checking username:', error);
      setUsernameError('Error checking username availability');
      return false;
    } finally {
      setCheckingUsername(false);
    }
  };

  // Create user in our database after successful Clerk signup
  const createUserInDatabase = async (clerkUser) => {
    try {
      console.log('=== DATABASE CREATION DEBUG ===');
      console.log('Clerk user ID:', clerkUser.id);
      
      const token = await getToken();
      console.log('Token received:', token ? 'Yes' : 'No');
      
      const userData = {
        id: clerkUser.id,
        username: username,
        email: emailAddress,
        phone_number: '', // Will be filled later in profile
        firstName: '', // Will be filled later in profile
        lastName: '',  // Will be filled later in profile
      };
      
      console.log('User data to send:', userData);
      console.log('API URL:', `${API_URL}/users`);

      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('User created in database successfully:', result);
      } else {
        let errorText;
        try {
          const responseText = await response.text();
          if (responseText.trim().startsWith('<')) {
            console.log('Received HTML response for user creation');
            errorText = 'Server returned an error page';
          } else {
            errorText = responseText;
          }
        } catch (parseError) {
          console.error('Could not parse user creation error response:', parseError);
          errorText = 'Unknown error';
        }
        console.error('Failed to create user in database:', response.status, errorText);
      }
    } catch (error) {
      console.error('Error creating user in database:', error);
    }
  };

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    console.log("=== SIGNUP DEBUG ===");
    console.log("isLoaded:", isLoaded);
    console.log("Form data:", { emailAddress, password, username });
    
    if (!isLoaded) {
      console.log("Clerk is not loaded yet");
      setError("Clerk is not loaded yet");
      return;
    }

    if (!emailAddress || !password || !username) {
      console.log("Missing required fields");
      setError("Please fill in all fields");
      return;
    }

    // Check username availability before proceeding
    const isUsernameAvailable = await checkUsernameAvailability(username);
    if (!isUsernameAvailable) {
      console.log("Username not available");
      return;
    }

    console.log("Starting sign-up process...");
    setError(""); // Clear any previous errors

    // Start sign-up process using email and password provided
    try {
      const signUpData = {
        emailAddress,
        password,
        username: username,
      };
      
      console.log('Signup data:', signUpData);
      
      const result = await signUp.create(signUpData);

      console.log("Sign-up result:", result);
      console.log("Sign-up status:", result.status);

      // Check if sign-up requires email verification
      if (result.status === 'missing_requirements') {
        console.log("Email verification required");
        // Send user an email with verification code
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
        setPendingVerification(true);
      } else if (result.status === 'complete') {
        console.log("Sign-up completed successfully");
        console.log("Created user ID:", result.createdUserId);
        await setActive({ session: result.createdSessionId });
        
        // Create user in our database
        console.log("Creating user in database...");
        await createUserInDatabase({ id: result.createdUserId });
        
        router.replace('/');
      } else {
        console.log("Unexpected sign-up status:", result.status);
        setError("Sign-up process incomplete. Please try again.");
      }
    } catch (err) {
      console.error("=== SIGNUP ERROR ===");
      console.error("Sign-up error:", err);
      console.error("Error details:", JSON.stringify(err, null, 2));
      console.error("Error type:", typeof err);
      console.error("Error message:", err.message);
      
      if (err.errors?.[0]?.code === 'form_identifier_exists') {
        setError("That email address is already in use. Please try another.");
      } else if (err.errors?.[0]?.code === 'form_password_pwned') {
        setError("This password has been found in a data breach. Please choose a different password.");
      } else if (err.errors?.[0]?.code === 'form_password_validation_failed') {
        setError("Password must be at least 8 characters long.");
      } else {
        setError(err.errors?.[0]?.message || "An error occurred. Please try again.");
      }
    }
  };

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return;

    if (!code) {
      setError("Please enter the verification code");
      return;
    }

    console.log("Attempting email verification...");
    setError("");

    try {
      // Use the code the user provided to attempt verification
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      console.log("Verification result:", completeSignUp);
      console.log("Verification status:", completeSignUp.status);

      // If verification was completed, set the session to active
      // and redirect the user
      if (completeSignUp.status === 'complete') {
        console.log("Email verification completed successfully");
        console.log("Created user ID:", completeSignUp.createdUserId);
        await setActive({ session: completeSignUp.createdSessionId });
        
        // Create user in our database
        console.log("Creating user in database after verification...");
        await createUserInDatabase({ id: completeSignUp.createdUserId });
        
        router.replace('/');
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error("Verification incomplete:", JSON.stringify(completeSignUp, null, 2));
        setError("Verification failed. Please check your code and try again.");
      }
    } catch (err) {
      console.error("Verification error:", err);
      console.error("Error details:", JSON.stringify(err, null, 2));
      
      if (err.errors?.[0]?.code === 'form_code_incorrect') {
        setError("Invalid verification code. Please check and try again.");
      } else {
        setError(err.errors?.[0]?.message || "Verification failed. Please try again.");
      }
    }
  };

  if (pendingVerification) {
    return (
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
      >
        <View style={styles.container}>
          <Image source={require("../../assets/images/revenue-i2.png")} style={styles.illustration} />
          
          <Text style={styles.title}>Verify your email</Text>
          <Text style={styles.subtitle}>We sent a verification code to {emailAddress}</Text>

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={20} color={COLORS.expense} />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={() => setError("")}>
                <Ionicons name="close" size={20} color={COLORS.textLight} />
              </TouchableOpacity>
            </View>
          ) : null}

          <TextInput
            style={[styles.input, error && styles.errorInput]}
            value={code}
            placeholder="Enter your verification code"
            placeholderTextColor="#9A8478"
            onChangeText={(code) => setCode(code)}
            keyboardType="numeric"
            maxLength={6}
          />

          <TouchableOpacity onPress={onVerifyPress} style={styles.button}>
            <Text style={styles.buttonText}>Verify</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => {
              setPendingVerification(false);
              setCode("");
              setError("");
              setUsername("");
            }} 
            style={styles.linkButton}
          >
            <Text style={styles.linkText}>Back to sign up</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    );
  }

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1 }}
      enableOnAndroid={true}
      enableAutomaticScroll={true}
    >
      <View style={styles.container}>
        <Image source={require("../../assets/images/revenue-i2.png")} style={styles.illustration} />

        <Text style={styles.title}>Create Account</Text>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={20} color={COLORS.expense} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => setError("")}>
              <Ionicons name="close" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input, 
              (error || usernameError) && styles.errorInput,
              username && !usernameError && !checkingUsername && styles.successInput
            ]}
            value={username}
            placeholderTextColor="#9A8478"
            placeholder="Username"
            onChangeText={(username) => setUsername(username)}
            autoCapitalize="none"
          />
          {checkingUsername && (
            <View style={styles.checkingIndicator}>
              <ActivityIndicator size="small" color={COLORS.primary} />
            </View>
          )}
          {username && !usernameError && !checkingUsername && (
            <Ionicons name="checkmark-circle" size={20} color={COLORS.income} style={styles.successIcon} />
          )}
        </View>
        {usernameError ? (
          <Text style={styles.errorText}>{usernameError}</Text>
        ) : null}
        <TextInput
          style={[styles.input, error && styles.errorInput]}
          autoCapitalize="none"
          value={emailAddress}
          placeholderTextColor="#9A8478"
          placeholder="Email"
          onChangeText={(email) => setEmailAddress(email)}
        />
     <TextInput
          style={[styles.input, error && styles.errorInput]}
          value={password}
          placeholderTextColor="#9A8478"
          placeholder="Password"
          secureTextEntry={true}
          onChangeText={(password) => setPassword(password)}
        />

        <TouchableOpacity 
          style={styles.button} 
          onPress={() => {
            console.log("=== BUTTON PRESSED ===");
            onSignUpPress();
          }}
        >
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.linkText}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}
