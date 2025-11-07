import React from "react";

const Title = ({ text1, text2 }) => {
  return (
    <div className="mb-8">
      <h1 className="text-4xl font-bold text-white">
        {text1} <span className="text-red-600">{text2}</span>
      </h1>
      <p className="text-gray-400 mt-2">Manage your business effectively</p>
    </div>
  );
};

export default Title;
