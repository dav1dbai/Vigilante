import React from "react";

export type FactCheckFlagProps = {
  result: boolean;
};

const FactCheckFlag: React.FC<FactCheckFlagProps> = ({ result }) => {
  const style: React.CSSProperties = {
    marginTop: "8px",
    padding: "4px 8px",
    backgroundColor: result ? "green" : "red",
    color: "#fff",
    borderRadius: "4px",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: "12px",
  };

  return (
    <div className="fact-check-flag" style={style}>
      {result ? "Verified Fact" : "Flagged as Misinformation"}
    </div>
  );
};

export default FactCheckFlag; 