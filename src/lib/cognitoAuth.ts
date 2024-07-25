import {
    InitiateAuthCommand,
    SignUpCommand,
    ConfirmSignUpCommand,
    GetUserCommand,
    GlobalSignOutCommand,
  } from "@aws-sdk/client-cognito-identity-provider";
  import { cognitoClient } from "./cognitoClient";
  
  const CLIENT_ID = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!;
  const USER_POOL_ID = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!;
  
  export async function signUp(email: string, password: string, firstName: string) {
    const command = new SignUpCommand({
      ClientId: CLIENT_ID,
      Username: email,
      Password: password,
      UserAttributes: [
        { Name: "email", Value: email },
        { Name: "given_name", Value: firstName }
      ],
    });
  
    try {
      const response = await cognitoClient.send(command);
      return response;
    } catch (error) {
      console.error("Error signing up:", error);
      throw error;
    }
  }
  
  export async function signIn(username: string, password: string) {
    const command = new InitiateAuthCommand({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: CLIENT_ID,
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
      },
    });
  
    try {
      const response = await cognitoClient.send(command);
      return response.AuthenticationResult;
    } catch (error) {
      console.error("Error signing in:", error);
      throw error;
    }
  }
  
  export async function getCurrentUser(accessToken: string) {
    const command = new GetUserCommand({
      AccessToken: accessToken,
    });

    try {
      const response = await cognitoClient.send(command);
      if (!response.UserAttributes) {
        throw new Error("User attributes not found");
      }

      const userAttributes = response.UserAttributes.reduce((acc, attr) => {
        if (attr.Name && attr.Value) {
          acc[attr.Name] = attr.Value;
        }
        return acc;
      }, {} as Record<string, string>);

      return {
        email: userAttributes['email'] || '',
        firstName: userAttributes['given_name'] || '',
        // ... any other attributes you want to include
      };
    } catch (error) {
      console.error("Error getting current user:", error);
      throw error;
    }
  }
  
  export async function signOut(accessToken: string) {
    const command = new GlobalSignOutCommand({
      AccessToken: accessToken,
    });
  
    try {
      await cognitoClient.send(command);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  }

  export async function verifyEmail(email: string, verificationCode: string) {
    const command = new ConfirmSignUpCommand({
      ClientId: CLIENT_ID,
      Username: email,
      ConfirmationCode: verificationCode,
    });

    try {
      const response = await cognitoClient.send(command);
      return response;
    } catch (error) {
      console.error("Error verifying email:", error);
      throw error;
    }
  }