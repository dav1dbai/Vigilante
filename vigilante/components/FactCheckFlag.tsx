import React, { useState } from 'react';

export type FactCheckFlagProps = {
  result: boolean;
  claims?: {
    claim: string;
    sources: string[];
    explanation: string;
    is_misleading: boolean;
  }[];
};

const FactCheckFlag: React.FC<FactCheckFlagProps> = ({ result, claims }) => {
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

  // If result is true or null/undefined, don't render anything
  if (result) {
    return null;
  }

  return (
    <>
      <div className="fact-check-flag" style={style} onClick={handleFlagClick}>
        <svg style={iconStyle} viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm0 14.5a6.5 6.5 0 110-13 6.5 6.5 0 010 13zm0-11a.75.75 0 01.75.75v4a.75.75 0 01-1.5 0v-4A.75.75 0 018 3.5zM8 10a1 1 0 100 2 1 1 0 000-2z"/>
        </svg>
        Flagged as Misinformation
      </div>

      {showModal && (
        <div style={modalOverlayStyle} onClick={handleModalClose}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600" }}>
              {result ? "Verification Details" : "False Claims"}
            </h3>
            <div style={modalContentStyle}>
              {claims ? (
                claims.map((claim, index) => (
                  <div key={index} className="mb-6 last:mb-0">
                    <p className="font-medium mb-2">{claim.claim}</p>
                    <p className="text-[14px] mb-2">{claim.explanation}</p>
                    {claim.sources.length > 0 && (
                      <div className="text-[12px] text-neutral-400">
                        <p className="mb-1">Sources:</p>
                        <ul className="list-disc pl-4">
                          {claim.sources.map((source, idx) => (
                            <li key={idx}>
                              <a 
                                href={source} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="hover:underline"
                              >
                                {source}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                result ? (
                  "This information has been verified by trusted sources."
                ) : (
                  <>
                    <p style={{ margin: "0 0 12px 0" }}>This claim has been marked as false.</p>
                    <p style={{ margin: 0 }}>Additional context: This is a misrepresentation of the facts. Please refer to reliable sources for accurate information.</p>
                  </>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FactCheckFlag; 