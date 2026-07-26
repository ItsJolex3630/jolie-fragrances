import urllib.parse

client_id = "655923798063-qf3loe2p20usk02tnp90cqp4ttu8r2u1.apps.googleusercontent.com"
redirect_uri = "https://jolie-fragrances-seven.vercel.app/api/auth/callback/google"

params = {
    "client_id": client_id,
    "redirect_uri": redirect_uri,
    "response_type": "code",
    "scope": "openid email profile",
    "prompt": "select_account",
    "access_type": "offline",
}

auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urllib.parse.urlencode(params)}"
print("Expected Google OAuth URL:")
print(auth_url)
print()
print("This is what NextAuth should be redirecting to.")
print("If it's NOT redirecting here, the provider is failing to initialize.")
