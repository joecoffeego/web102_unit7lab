import { useState } from 'react'
import './CreatePost.css'
import { supabase } from '../client';

const CreatePost = () => {

    const [post, setPost] = useState({
        title: "",
        author: "",
        description: ""
    });

    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState("");

    const LLM_API_KEY = import.meta.env.VITE_LLM_API_KEY;
    const LLM_ENDPOINT = import.meta.env.VITE_LLM_ENDPOINT;

    const handleChange = (event) => {
        const { name, value } = event.target;
        setPost((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const createPost = async (event) => {
        event.preventDefault();

        setError("");
        setIsGenerating(true);

        console.log("SUBMIT START");

        try {
            const response = await fetch(`${LLM_ENDPOINT}api/v1/messages`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${LLM_API_KEY}`
                },
                body: JSON.stringify({
                    model: "openai/gemma4:26b",
                    messages: [
                        {
                            role: "user",
                            content: `You are a classifier. Return ONLY valid JSON with two fields:
                            rating (1-10) and category (one word).

                            Text: "${post.description}"`
                        }
                    ]
                })
            });

            const raw = await response.json();
            console.log("FULL RAW RESPONSE:", raw);

            // 🚨 Extract AI text correctly (based on your real API response)
            const aiText = raw?.content?.[0]?.text;

            if (!aiText) {
                throw new Error("AI returned no text");
            }

            console.log("AI TEXT:", aiText);

            // 🔍 Extract JSON safely
            const match = aiText.match(/\{[\s\S]*\}/);

            if (!match) {
                throw new Error("No JSON found in AI response");
            }

            const parsed = JSON.parse(match[0]);

            let rating = Number(parsed.rating ?? 5);
            let category = parsed.category ?? "general";

            // clamp rating
            rating = Math.max(1, Math.min(10, rating));

            console.log("FINAL VALUES:", { rating, category });

            // 💾 Insert into Supabase
            const { error: supabaseError } = await supabase
                .from('Posts')
                .insert({
                    title: post.title,
                    author: post.author,
                    description: post.description,
                    spiciness: rating,
                    category: category
                });

            if (supabaseError) {
                throw supabaseError;
            }

            console.log("INSERT SUCCESS");

            window.location = "/";

        } catch (err) {
            console.error("FAILED:", err);
            setError("AI generation failed — check console");
            setIsGenerating(false);
        }
    };

    return (
        <div>

            {isGenerating && (
                <div className="loader-container">
                    <div className="ai-spinner"></div>
                    <h2>Analyzing Challenge... 🧠</h2>
                    <p>Please wait</p>
                </div>
            )}

            {!isGenerating && (
                <form onSubmit={createPost}>

                    <label>Title</label><br />
                    <input name="title" onChange={handleChange} /><br /><br />

                    <label>Author</label><br />
                    <input name="author" onChange={handleChange} /><br /><br />

                    <label>Description</label><br />
                    <textarea name="description" rows="5" cols="50" onChange={handleChange} />

                    <br /><br />

                    <input type="submit" value="Submit" />
                </form>
            )}

            {error && (
                <p style={{ color: "red" }}>{error}</p>
            )}

        </div>
    );
};

export default CreatePost;