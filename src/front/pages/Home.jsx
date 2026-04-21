import { useEffect, useRef, useState } from "react";
import { fetchNowPlaying, fetchSpotifyQueue } from "../services/backEndServices";
import SoundWave from "../components/SoundWave";

export const Home = () => {
	const [nowPlaying, setNowPlaying] = useState(null)
	const [queue, setQueue] = useState([])
	const [progress, setProgress] = useState(0)
	const progressRef = useRef(0)

	const formatTime = (ms) => {
		if (!ms) return "0:00"
		const total = Math.floor(ms / 1000)
		const m = Math.floor(total / 60)
		const s = total % 60
		return `${m}:${s.toString().padStart(2, "0")}`
	}

	useEffect(() => {
		const poll = async () => {
			const [npData, qData] = await Promise.all([
				fetchNowPlaying(),
				fetchSpotifyQueue()
			]);

			if (npData && npData.playing) {
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

	return (
		<div className="container-fluid">
			<div className="p-2 rounded-3 mb-3" style={{ background: "var(--card)" }}>
				<h1 className="fw-bold">Pide música en segundos y sigue la cola al momento.</h1>
				<h6>Busca como en Spotify, añade tu tema favorito y revisa el estado de tus peticiones.</h6>
				<div className="d-flex justify-content-center gap-2">
					<button className="btn primary-bottom">
						<i className="bi bi-search me-2"></i><span>Buscar canción</span>
					</button>
					<button className="btn secondary-bottom">
						<i className="bi bi-music-note-list me-2"></i><span>Mis peticiones</span>
					</button>
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

					<h3 className="fw-bold mb-2">A continuación</h3>
					{queue.map((track, index) => {
						return (
							<div className="hero-card mb-1" key={index}>
								<img
									id="heroCover"
									src={track?.album_image}
									alt="cover actual"
								/>
								<div id="heroTrackInfo">
									<div id="heroTrackTitle">{track?.track_name}</div>
									<div id="heroTrackArtist">{track?.artist_name}</div>
								</div>
								<div id="heroTime">{index + 1}</div>
							</div>
						)
					})}
				</>
			) : (
				<div id="playerCard" className="mb-3 d-flex justify-content-center">No hay nada sonando en este momento</div>
			)}
		</div>
	);
}; 