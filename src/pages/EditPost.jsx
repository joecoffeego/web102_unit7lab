import {useState, useEffect} from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import './EditPost.css'
import { supabase } from '../client'

const EditPost = ({data}) => {
    const {id} = useParams()
    const navigate = useNavigate()
    const [post, setPost] = useState({id: null, title: "", author: "", description: ""})
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!id) return
        const fetchPost = async () => {
            const { data, error } = await supabase
                .from('Posts') // ensure table name matches exactly
                .select('*')
                .eq('id', id)
                .single()
            if (error) {
                console.error('Fetch post error:', error)
                return
            }
            setPost({ id: data.id, title: data.title || '', author: data.author || '', description: data.description || '' })
        }
        fetchPost()
    }, [id])

    const handleChange = (event) => {
        const {name, value} = event.target
        setPost( (prev) => ({ ...prev, [name]: value }) )
    }

    const updatePost = async (event) => {
        event.preventDefault()
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('Posts')
                .update({
                    title: post.title,
                    author: post.author,
                    description: post.description
                })
                .eq('id', id)
                .select()
            if (error) {
                console.error('Update error:', error)
                alert('Failed to update post: ' + error.message)
                setLoading(false)
                return
            }
            console.log('Updated row:', data)
            navigate('/') // better than window.location
        } catch (err) {
            console.error('Unexpected error:', err)
            alert('Unexpected error occurred')
            setLoading(false)
        }
    }

    const deletePost = async (event) => {
        event.preventDefault();

        if (!confirm('Are you sure you want to delete this post?')) return;

        setLoading(true)

        // handle numeric id vs uuid string
        const idForQuery = /^\d+$/.test(id) ? Number(id) : id

        try {
            const { data, error } = await supabase
                .from('Posts')
                .delete()
                .eq('id', idForQuery)

            if (error) {
                console.error('Delete error:', error)
                alert('Failed to delete post: ' + error.message)
                setLoading(false)
                return
            }

            console.log('Deleted row:', data)
            navigate('/')
        } catch (err) {
            console.error('Unexpected delete error:', err)
            alert('Unexpected error occurred')
            setLoading(false)
        }
    };

    return (
        <div>
            <form onSubmit={updatePost}>
                <label htmlFor="title">Title</label> <br />
                <input type="text" id="title" name="title" value={post.title} onChange={handleChange} /><br />
                <br/>

                <label htmlFor="author">Author</label><br />
                <input type="text" id="author" name="author" value={post.author} onChange={handleChange} /><br />
                <br/>

                <label htmlFor="description">Description</label><br />
                <textarea rows="5" cols="50" id="description" name="description" value={post.description} onChange={handleChange} />
                <br/>
                <input type="submit" value={loading ? "Submitting..." : "Submit"} disabled={loading} />
                <button type="button" className="deleteButton" onClick={deletePost}>Delete</button>
            </form>
        </div>
    )
}

export default EditPost