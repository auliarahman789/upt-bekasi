import React from "react";

const LoginPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        <p className="text-center text-gray-600">
          Please use the login button in the navigation bar to sign in.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
