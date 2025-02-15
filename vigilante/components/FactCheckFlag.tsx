import React, { useState } from 'react';

export type FactCheckFlagProps = {
  result: boolean;
};

const FactCheckFlag: React.FC<FactCheckFlagProps> = ({ result }) => {
  const [showModal, setShowModal] = useState(false);

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
    cursor: "pointer"
  };

  const iconStyle: React.CSSProperties = {
    width: "16px",
    height: "16px",
  };

  const modalOverlayStyle: React.CSSProperties = {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: showModal ? "flex" : "none",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000
  };

  const modalStyle: React.CSSProperties = {
    backgroundColor: "#2F3336",
    borderRadius: "16px",
    padding: "20px",
    maxWidth: "400px",
    width: "90%",
    color: "white",
    position: "relative" as const,
    zIndex: 1001
  };

  const modalContentStyle = {
    marginTop: "12px",
    fontSize: "14px",
    lineHeight: "1.5"
  };

  const handleFlagClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowModal(true);
  };

  const handleModalClose = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setShowModal(false);
    }
  };

  return (
    <>
      <div className="fact-check-flag" style={style} onClick={handleFlagClick}>
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

      {showModal && (
        <div style={modalOverlayStyle} onClick={handleModalClose}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600" }}>
              {result ? "Verification Details" : "False Claims"}
            </h3>
            <div style={modalContentStyle}>
              {result ? (
                "This information has been verified by trusted sources."
              ) : (
                <>
                  <p style={{ margin: "0 0 12px 0" }}>This claim has been marked as false.</p>
                  <p style={{ margin: 0 }}>Additional context: This is a misrepresentation of the facts. Please refer to reliable sources for accurate information.</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FactCheckFlag; 