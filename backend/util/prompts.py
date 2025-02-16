EXTRACT_CLAIMS_PROMPT = """\
Your task is to extract and list significant, verifiable claims from the post provided. Each claim must:
- Have a clearly identifiable subject (e.g., a named person, organization, or entity).
- Provide sufficient context so that it can be independently verified.
- NOT be a trivial or merely descriptive summary of data trends. Avoid claims that only restate observable facts (for example, a simple increase in numbers) unless they include an evaluative judgment, causal assertion, or novel conclusion.
- NOT be based solely on vague observations, personal anecdotes, or references to unnamed characters.

ONLY respond with the claims, and nothing else. Do NOT number the claims.
Each claim should appear on a separate line.

Example Input:
Author: The Financial Watchdog
Content: The recent restructuring at the Department of Fisheries resulted in a 50% drop in fish market revenues, raising questions about its management effectiveness.
Example Output:
The recent restructuring at the Department of Fisheries resulted in a 50% drop in fish market revenues.
The significant revenue drop raises concerns about the department's management effectiveness.

Example Input:
Author: MarketTrendsDaily
Content: GDP has increased by 2% over the past year.
Example Output:
"""

SOURCES_SYSTEM_PROMPT = """\
Your job is to analyze the veracity of a claim.

Respond using 2-3 sentences.

Only respond with evidence relating directly to the claim; only use the full text of the post as additional context.
"""

SOURCES_INPUT_PROMPT = """\
Here is the full text of a post:
"{post_content}"

Find evidence to support or reject this claim (and ONLY this claim) from the post:
"{claim}".
"""

DETERMINE_IS_MISLEADING_PROMPT = """\
Given this explanation, respond with whether the claim is ACCURATE or MISLEADING.

Only respond with ACCURATE or MISLEADING, nothing else.
"""

IS_VERIFIABLE_PROMPT = """\
Does this statement make researchable claims?

ONLY respond YES or NO. Do not respond with anything else.
"""

IS_CONTROVERSIAL_PROMPT = """\
Is this claim controversial/disputable?

ONLY respond YES or NO. Do not respond with anything else.
"""

SEMANTIC_RELEVANCE_PROMPT = """\
Does this tweet fall under the following description?

{description}

ONLY respond YES or NO. Do not respond with anything else.
"""

UNIFIED_ANALYSIS_PROMPT = """\
You are an AI assistant tasked with analyzing social media posts for claims and their veracity.

For the given post, you must:
1. Determine if the post contains verifiable claims (YES/NO)
2. If verifiable, extract distinct claims from the post
3. For each claim:
   - Evaluate if it's controversial (YES/NO)
   - Provide evidence/explanation
   - Determine if it's misleading (YES/NO)

The post's timestamp is: {timestamp}

Respond in the following JSON format:
{
    "is_verifiable": "YES/NO",
    "claims": [
        {
            "claim": "extracted claim text",
            "is_controversial": "YES/NO", 
            "explanation": "evidence and analysis",
            "is_misleading": "YES/NO"
        }
    ]
}

Only respond with valid JSON, nothing else."""

