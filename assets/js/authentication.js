class BiometricAuth {
  constructor() {
    this.isAuthenticated = false;
    this.init();
    console.log("BiometricAuth initialized");
  }

  init() {
    // Check if the browser supports WebAuthn
    if (!window.PublicKeyCredential) {
      console.warn("WebAuthn is not supported in this browser");
      alert("Your browser does not support biometric authentication");
      return;
    }
    console.log("WebAuthn is supported");
  }

  async authenticate() {
    try {
      console.log("Starting authentication process...");

      // First check if biometric auth is available
      const available =
        await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      console.log("Biometric availability:", available);

      if (!available) {
        alert("Biometric authentication is not available on this device");
        return false;
      }

      // Get the effective domain
      const effectiveDomain = this.getEffectiveDomain();
      console.log("Using domain:", effectiveDomain);

      // Generate a random challenge
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      // Create credential options
      const credentialCreationOptions = {
        publicKey: {
          challenge: challenge,
          rp: {
            name: "BookTracker",
            id: effectiveDomain,
          },
          user: {
            id: Uint8Array.from("UZSL85T9AFC", (c) => c.charCodeAt(0)),
            name: "user@example.com",
            displayName: "BookTracker User",
          },
          pubKeyCredParams: [
            {
              type: "public-key",
              alg: -7,
            },
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            requireResidentKey: false,
            userVerification: "preferred",
          },
          timeout: 60000,
        },
      };

      console.log("Requesting credential creation...");

      // Start the authentication process
      const credential = await navigator.credentials.create(
        credentialCreationOptions
      );
      console.log("Credential created:", credential);

      if (credential) {
        this.isAuthenticated = true;
        // Update UI to show success
        const authButton = document.getElementById("auth-button");
        authButton.innerHTML = `
          <span class="material-icons">check_circle</span>
          Authenticated
        `;
        authButton.classList.add("authenticated");

        // Store authentication state
        localStorage.setItem("isAuthenticated", "true");

        return true;
      }
    } catch (error) {
      console.error("Detailed authentication error:", error);

      // More user-friendly error messages
      let errorMessage = "Authentication failed: ";
      if (error.message.includes("invalid domain")) {
        errorMessage += "Please access this site through localhost or HTTPS.";
      } else {
        errorMessage += error.message;
      }

      alert(errorMessage);
      return false;
    }
  }

  getEffectiveDomain() {
    const hostname = window.location.hostname;

    // Check if we're on localhost
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "localhost";
    }

    // Check if we're on a secure connection
    if (window.location.protocol === "https:") {
      return hostname;
    }

    // If neither, default to localhost
    return "localhost";
  }

  checkAuthState() {
    const isAuth = localStorage.getItem("isAuthenticated") === "true";
    console.log("Current auth state:", isAuth);
    return isAuth;
  }
}

// Initialize authentication
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, initializing authentication...");
  const auth = new BiometricAuth();
  const authButton = document.getElementById("auth-button");

  if (!authButton) {
    console.error("Auth button not found in DOM");
    return;
  }

  // Check if already authenticated
  if (auth.checkAuthState()) {
    authButton.innerHTML = `
      <span class="material-icons">check_circle</span>
      Authenticated
    `;
    authButton.classList.add("authenticated");
  }

  // Add click event listener
  authButton.addEventListener("click", async () => {
    console.log("Auth button clicked");
    if (!auth.checkAuthState()) {
      const success = await auth.authenticate();
      if (success) {
        console.log("Authentication successful");
      } else {
        console.log("Authentication failed");
      }
    }
  });
});
