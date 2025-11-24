import { SignIn } from "@clerk/clerk-react";

const SignInPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      {/* Added margin-top to account for the fixed navbar */}
      <div className="mt-20">
        <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" forceRedirectUrl="/chat" />
      </div>
    </div>
  );
};

export default SignInPage;