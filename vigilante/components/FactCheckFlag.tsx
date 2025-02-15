import React from "react";

export type FactCheckFlagProps = {
  result: boolean;
};

const FactCheckFlag: React.FC<FactCheckFlagProps> = ({ result }) => {
  const style: React.CSSProperties = {
    padding: "8px 12px",
    backgroundColor: result ? "#E3F3E6" : "#6E1B1B",
    color: result ? "#1A8917" : "#FFF5F5",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    gap: "6px",
  };

  const iconStyle: React.CSSProperties = {
    width: "16px",
    height: "16px",
  };

  return (
    <div className="fact-check-flag" style={style}>
      {result ? (
        <svg style={iconStyle} viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm3.72 6.96l-4.2 4.2a.75.75 0 01-1.06 0l-2.18-2.18a.75.75 0 011.06-1.06l1.65 1.65 3.67-3.67a.75.75 0 111.06 1.06z"/>
        </svg>
      ) : (
        <svg style={iconStyle} viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm0 14.5a6.5 6.5 0 110-13 6.5 6.5 0 010 13zm0-11a.75.75 0 01.75.75v4a.75.75 0 01-1.5 0v-4A.75.75 0 018 3.5zM8 10a1 1 0 100 2 1 1 0 000-2z"/>
        </svg>
      )}
      {result ? "Verified Information" : "Flagged as Misinformation"}
    </div>
  );
};


// const FactCheckFlag: React.FC<FactCheckFlagProps> = ({ result }) => {
//   const style: React.CSSProperties = {
//     marginTop: "8px",
//     padding: "4px 8px",
//     backgroundColor: result ? "green" : "red",
//     color: "#fff",
//     borderRadius: "4px",
//     textAlign: "center",
//     fontWeight: "bold",
//     fontSize: "12px",
//   };

//   return (
//     <div className="fact-check-flag" style={style}>
//       {result ? "Verified Fact" : "Flagged as Misinformation"}
//     </div>
//   );
// };

export default FactCheckFlag; 