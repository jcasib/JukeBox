import { useEffect, useState } from "react"
import { fetchTopArtists, fetchTopTracks, searchTracks, createRequest } from "../services/backEndServices"

export const Search = () => {

    const [query, setQuery] = useState("")
    const [loading, setLoading] = useState(false)
    const [feedback, setFeedback] = useState(null)

    const[requestingId, setRequestingId] = useState(null)
    const [requestedIds, setRequestedIds] = useState([])

    const [results, setResults] = useState([])
    const [searching, setSearching] = useState(false)
    const [topTracks, setTopTracks] = useState([]);
    const [topArtists, setTopArtists] = useState([]);
    const [topsLoading, setTopsLoading] = useState(true);

    useEffect(() => {
        const loadTops = async () => {
            setTopsLoading(true)
            const [tracks, artists] = await Promise.all([
                fetchTopTracks("medium_term"),
                fetchTopArtists("medium_term")
            ])
            setTopTracks(tracks?.items || [])
            setTopArtists(artists?.items || [])
            setTopsLoading(false)
            console.log(tracks)
        }
        loadTops()
    }, [])

    useEffect(() => {
        if (query.trim().length < 2) {
            setResults([])
            return
        }
        const token = localStorage.getItem("token")
        const delay = setTimeout(async () => {
            setSearching(true)
            const data = await searchTracks(query, token)
            setResults(data?.tracks?.items || [])
            setSearching(false)
        }, 400)

        return () => clearTimeout(delay)
    }, [query])

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
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    ></input>
                </form>
            </div>

            {query.trim().length >= 2 && (
                <div className="mb-4">
                    {searching ? (
                        <div className="text-center py-3">
                            <div className="spinner-border spinner-border-sm" role="status" />
                        </div>
                    ) : results.length === 0 ? (
                        <div className="text-center text-muted py-3">Sin resultados</div>
                    ) : (
                        results.map((track, index) => (
                            <div id="topSong-card" className="mb-1" key={index}>
                                <img
                                    id="topSongCover"
                                    src={track.album?.images?.[2]?.url || track.album?.images?.[0]?.url}
                                    alt={track.name}
                                />
                                <div id="topSongTrackInfo">
                                    <div id="topSongTrackTitle">{track.name}</div>
                                    <div id="topSongTrackArtist">{track.artists.map(a => a.name).join(", ")}</div>
                                </div>
                                <button className="btn btn-sm primary-bottom">
                                    <i className="bi bi-plus-lg" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* TOPS */}
            <div className="mb-4">
                <h6 className="fw-bold mb-3">Canciones más sonadas</h6>
                {topsLoading ? (
                    <div className="text-center py-3">
                        <div className="spinner-border spinner-border-sm" role="status" />
                    </div>
                ) : (
                    topTracks.map((track, index) => (
                        <div id="topSong-card" className="mb-1" key={index}>
                            <img
                                id="topSongCover"
                                src={track.album?.images?.[2]?.url || track.album?.images?.[0]?.url}
                                alt={track.name}
                            />
                            <div id="topSongTrackInfo">
                                <div id="topSongTrackTitle">{track?.name}</div>
                                <div id="topSongTrackArtist">{track.artists.map(a => a.name).join(", ")}</div>
                            </div>
                            <button className="btn btn-sm primary-bottom">
                                <i className="bi bi-plus-lg" />
                            </button>
                        </div>
                    ))
                )}
            </div>
            <div>
                <h6 className="fw-bold mb-3">Artistas más frecuentes</h6>
                {topsLoading ? (
                    <div className="text-center py-3">
                        <div className="spinner-border spinner-border-sm" role="status" />
                    </div>
                ) : (
                    <div className="row d-flex justify-content-around">
                        {topArtists.map(artist => (
                            <div className="col-3 col-md-1 mb-2" key={artist.id}>
                                <div className="ratio ratio-1x1">
                                    <img
                                        className="img-fluid rounded-circle object-fit-cover"
                                        src={artist.images?.[2]?.url || artist.images?.[0]?.url}
                                        alt={artist.name}
                                    />
                                </div>
                                <div className="text-center" style={{ fontSize: "10px" }}>{artist.name}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}