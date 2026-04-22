import { useEffect, useState } from "react"

export const Search = () => {

    const [query, setQuery] = useState("")
    const [loading, setLoading] = useState(false)
    const [feedback, setFeedback] = useState(null)
    const [topsLoading, setTopsLoading]   = useState(true)

    useEffect(() => {
        setTopsLoading(true)
        const [tracks, artist] = await Promise.all([
            fetch
        ])
    })

    return (
        <div className="container-fluid">
            <div className="position-relative mb-3 border rounded-pill px-3">
                <form className="d-flex gap-2 align-items-center">
                    <i className="bi bi-search fs-6"></i>
                    <input
                        id="searchBar"
                        type="text"
                        className="form-control bg-transparent shadow-none p-2"
                        placeholder="Busca canciones o artistas..."
                    ></input>
                </form>
            </div>
            {/* TOPS */}
            <div>
                
            </div>
        </div>
    )
}