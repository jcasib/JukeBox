import { useEffect, useRef, useState } from "react";
import { fetchNowPlaying, fetchSpotifyQueue, fetchRecentlyPlayed } from "../services/backEndServices";
import SoundWave from "../components/SoundWave";
import { Link } from "react-router-dom";
import { TutorialTooltip } from "../components/TutorialTooltip"
import useGlobalReducer from "../hooks/useGlobalReducer"

export const Home = () => {
	const [nowPlaying, setNowPlaying] = useState(null)
	const [queue, setQueue] = useState([])
	const [recentlyPlayed, setRecentlyPlayed] = useState([])
	const [activeTab, setActiveTab] = useState("queue")
	const [progress, setProgress] = useState(0)
	const progressRef = useRef(0)
	const lastTrackIdRef = useRef(null)

	const loadRecentlyPlayed = async () => {
		const data = await fetchRecentlyPlayed(20)
		setRecentlyPlayed(data?.tracks || [])
	}

	useEffect(() => {
		loadRecentlyPlayed()
	}, [])

	useEffect(() => {
		const id = setInterval(loadRecentlyPlayed, 20000)
		return () => clearInterval(id)
	}, [])

	useEffect(() => {
		const poll = async () => {
			const [npData, qData] = await Promise.all([
				fetchNowPlaying(),
				fetchSpotifyQueue()
			]);

			if (npData && npData.playing) {
				if (lastTrackIdRef.current !== npData.track_id) {
					lastTrackIdRef.current = npData.track_id
					setTimeout(loadRecentlyPlayed, 20000)
				}
				setNowPlaying(prev => {
					if (!prev || prev.track_id !== npData.track_id) {
						return npData
					}
					return { ...prev, ...npData }
				})
				progressRef.current = npData.progress_ms
				setProgress(npData.progress_ms)
			}
			setQueue(qData?.queue || [])
		}
		poll()
		const id = setInterval(poll, 5000)
		return () => clearInterval(id)
	}, [])

	const { store, dispatch } = useGlobalReducer()

	// Detectar primera vez
	useEffect(() => {
		const done = localStorage.getItem("tutorial_done")
		if (!done) {
			dispatch({ type: 'start_tutorial' })
		}
	}, [])

	const homeTutorialSteps = [
		{
			selector: "#playerCard",
			title: "🎵 Canción en reproducción",
			description: "Aquí ves la canción que está sonando en este momento en el bar."
		},
		{
			selector: ".d-flex.gap-2.mb-3",
			title: "📋 Cola e historial",
			description: "Cambia entre ver lo que viene a continuación y las canciones que han sonado recientemente."
		},
		{
			selector: "[href='/search']",
			title: "🔍 Buscar canciones",
			description: "Pulsa aquí para buscar tu canción favorita y pedirla.",
			navigateTo: "/search"
		}
	]

	return (
		<div className="container-fluid">
			<div className="p-2 rounded-3 mb-3" style={{ background: "var(--card)" }}>
				<h1 className="fw-bold">Pide música en segundos y sigue la cola al momento.</h1>
				<h6>Busca como en Spotify, añade tu tema favorito y revisa el estado de tus peticiones.</h6>
				<div className="d-flex justify-content-center gap-2">
					<Link to="/search" className="btn primary-bottom">
						<i className="bi bi-search me-2"></i><span>Buscar canción</span>
					</Link>
					<Link to="/requests" className="btn secondary-bottom">
						<i className="bi bi-music-note-list me-2"></i><span>Mis peticiones</span>
					</Link>
				</div>
			</div>

			{nowPlaying ? (
				<>
					<div id="playerCard" className="mb-3">
						<img
							id="playerCover"
							src={nowPlaying?.album_image}
							alt="now playing"
						/>
						<div id="playerInfo">
							<div id="playerTitle">{nowPlaying?.track_name}</div>
							<div id="playerArtist">{nowPlaying?.artist_name}</div>
						</div>
						<div id="playerBars">
							<SoundWave isPlaying={nowPlaying} />
						</div>
					</div>

					<div className="d-flex gap-2 mb-3">
						<button
							className={`btn ${activeTab === "queue" ? "primary-bottom" : "secondary-bottom"}`}
							onClick={() => setActiveTab("queue")}
						>
							<i className="bi bi-collection-play me-2"></i>A continuación
						</button>
						<button
							className={`btn ${activeTab === "history" ? "primary-bottom" : "secondary-bottom"}`}
							onClick={() => setActiveTab("history")}
						>
							<i className="bi bi-clock-history me-2"></i>Escuchado recientemente
						</button>
					</div>

					{activeTab === "queue" && (
						queue.length === 0
							? <div className="text-center text-muted py-3">La cola está vacía</div>
							: queue.map((track, index) => (
								<div className="hero-card mb-1" key={index}>
									<img id="heroCover" src={track?.album_image} alt="cover actual" />
									<div id="heroTrackInfo">
										<div id="heroTrackTitle">{track?.track_name}</div>
										<div id="heroTrackArtist">{track?.artist_name}</div>
									</div>
									<div id="heroTime">{index + 1}</div>
								</div>
							))
					)}

					{activeTab === "history" && (
						recentlyPlayed.length === 0
							? <div className="text-center text-muted py-3">Sin historial todavía</div>
							: recentlyPlayed.map((track, index) => (
								<div className="hero-card mb-1" key={index}>
									<img id="heroCover" src={track?.album_image} alt="cover" />
									<div id="heroTrackInfo">
										<div id="heroTrackTitle">{track?.track_name}</div>
										<div id="heroTrackArtist">{track?.artist_name}</div>
									</div>
								</div>
							))
					)}
				</>
			) : (
				<div id="playerCard" className="mb-3 d-flex justify-content-center">No hay nada sonando en este momento</div>
			)}
			<TutorialTooltip steps={homeTutorialSteps} />
		</div>
	);
};