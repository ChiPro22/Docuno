import { SignUp } from "@clerk/clerk-react";

const SignUpPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="mt-20">
        <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" forceRedirectUrl="/chat" />
      </div>
    </div>
  );
};

export default SignUpPage;