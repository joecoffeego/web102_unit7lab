import { useState } from 'react'
import './CreatePost.css'
import { supabase } from '../client'

export default function CreatePost() {
    const [post, setPost] = useState({ title: "", author: "", description: "" })
    const [loading, setLoading] = useState(false)

    const handleChange = (event) => {
        const { name, value } = event.target
        setPost(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setLoading(true)

        try {
            const { data, error } = await supabase
                .from('Posts') // ensure this matches your table name exactly
                .insert([
                    {
                        title: post.title,
                        author: post.author,
                        description: post.description
                    }
                ])
                .select()

            if (error) {
                console.error('Supabase insert error:', error)
                alert('Failed to create post: ' + error.message)
                setLoading(false)
                return
            }

            console.log('Inserted row:', data)
            // Navigate after success
            window.location = "/"
        } catch (err) {
            console.error('Unexpected error:', err)
            alert('Unexpected error occurred')
            setLoading(false)
        }
    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <label htmlFor="title">Title</label> <br />
                <input
                    type="text"
                    id="title"
                    name="title"
                    value={post.title}
                    onChange={handleChange}
                /><br />
                <br/>

                <label htmlFor="author">Author</label><br />
                <input
                    type="text"
                    id="author"
                    name="author"
                    value={post.author}
                    onChange={handleChange}
                /><br />
                <br/>

                <label htmlFor="description">Description</label><br />
                <textarea
                    rows="5"
                    cols="50"
                    id="description"
                    name="description"
                    value={post.description}
                    onChange={handleChange}
                >
                </textarea>
                <br/>
                <input
                    type="submit"
                    value={loading ? "Submitting..." : "Submit"}
                    disabled={loading}
                /> 
            </form>
        </div>
    )
}