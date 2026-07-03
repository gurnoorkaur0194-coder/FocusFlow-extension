const GEMINI_API_KEY = "ENTER YOUR OWN GEMINI API KEY HERE";

export async function analyzeYoutube(
  goal: string,
  title: string
): Promise<boolean> {

    const prompt = `
Study Goal:
${goal}

YouTube Video:
${title}

Reply with ONLY one word.

true = relevant for the goal

false = not relevant

No explanation.
`;

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: prompt
                            }
                        ]
                    }
                ]
            })
        }
    );

    const data = await response.json();

    const answer =
        data.candidates?.[0]?.content?.parts?.[0]?.text
            ?.trim()
            ?.toLowerCase();

    return answer === "true";
}

analyzeYoutube(
    "UPSC Ethics",
    "Justice in Public Administration Lecture"
).then(console.log);