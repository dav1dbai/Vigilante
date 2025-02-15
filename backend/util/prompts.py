EXTRACT_CLAIMS_PROMPT = """\
Your task is to split a post into a list of claims.

ONLY respond with the claims, and nothing else. Do NOT number the claims.

Respond with a separate claim on a new line.

## Example Input:
Author: SWAFF
Content: We could cure cancer, but we're feedin' our money to defense contractors and foreign gov'ts. and LGBTQ BS #CancerVaccine is our battle cry, showin' how we neglect our health for war. We need to make #MAHA lifestyle the American lifestyle.

## Example Output:
We could cure cancer.
Money is being sent to foreign governments and defense contractors instead of cancer research.
The focus on LGBTQ issues distracts from cancer research and the need for a cancer vaccine.
The US neglects its health in favor of funding war efforts.
The MAHA lifestyle should be adopted as the American lifestyle.

## Example Input:
Author: Charlie Kirk
Content: The speed, depth, and power of DOGE has shocked both supporters and critics. I’m surprised and I’m thrilled. It’s fundamentally reshaping the future of what’s possible in government. Historic.

## Example Output:
The speed, depth, and power of DOGE has shocked both supporters and critics.
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
