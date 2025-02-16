import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

const TextFormat = ({ text }) => {
  const transformText = (text) => {
    const parts = text.split(/(\[\d+\])/) // Split on citation references like [1], [2], etc.
    let result = []
    let citationGroup = []

    parts.forEach((part, index) => {
      if (/\[\d+\]/.test(part)) {
        // If it's a citation, add it to the citation group
        citationGroup.push(part.replace(/[\[\]]/g, ""))
      } else if (part.length > 0) {
        // If it's regular text, flush the citation group with commas, then add the regular text
        if (citationGroup.length > 0) {
          result.push(<sup key={`sup-${index}`}>{citationGroup.join(",")}</sup>)
          citationGroup = []
        }
        result.push(part)
      }
    })

    // Flush any remaining citations
    if (citationGroup.length > 0) {
      result.push(<sup key="last-sup">{citationGroup.join(",")}</sup>)
    }

    return result
  }

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ node, children }) => {
          const textContent = children
            .map((child) =>
              typeof child === "string" ? child : child.props.children
            )
            .join("") // Ensure we join the string parts safely
          return <p>{transformText(textContent)}</p>
        }
      }}>
      {text}
    </ReactMarkdown>
  )
}

export default TextFormat
