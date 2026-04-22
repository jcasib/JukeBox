const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const fetchNowPlaying = async () => {
    try {
        const response = await fetch(`${BACKEND_URL}/api/public/now-playing`);
        const data = await response.json()
        if (!response.ok) {
            return false;
        }
        return data;
    } catch (error) {
        return null;
    }
}

export const fetchSpotifyQueue = async () => {
    try {
        const response = await fetch(`${BACKEND_URL}/api/public/spotify-queue`);
        const data = await response.json()
        if (!response.ok) {
            return false;
        }
        return data;
    } catch (error) {
        return { queue: [] };
    }
}

export const fetchTopTracks = async (timeRange = "medium_term", limit = 10) => {
    try {
        const response = await fetch(
            `${BACKEND_URL}/api/public/top-tracks?time_range=${timeRange}&limit=${limit}`
        );
        return await response.json();
    } catch (error) {
        console.error("Error fetching top tracks:", error);
        return null;
    }
};

export const fetchTopArtists = async (timeRange = "medium_term", limit = 10) => {
    try {
        const response = await fetch(
            `${BACKEND_URL}/api/public/top-artists?time_range=${timeRange}&limit=${limit}`
        );
        return await response.json();
    } catch (error) {
        console.error("Error fetching top artists:", error);
        return null;
    }
};

export const getAutocomplete = async (q, token) => {
    try {
        const res = await fetch(`${BACKEND_URL}/api/spotify/autocomplete?q=${encodeURIComponent(q)}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return await res.json();
    } catch { return []; }
};

export const searchTracks = async (q, token) => {
    try {
        const response = await fetch(
            `${BACKEND_URL}/api/spotify/search?q=${encodeURIComponent(q)}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        return await response.json();
    } catch (error) {
        console.error("Error searching tracks:", error);
        return null;
    }
};

export const createRequest = async (track, token) => {
    try {
        const response = await fetch(`${BACKEND_URL}/api/requests`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                track_id: track.id,
                track_uri: track.uri,
                track_name: track.name,
                artist_name: track.artists?.map(a => a.name).join(", "),
                album_image: track.album?.images?.[0]?.url
            })
        });

        return await response.json();
    } catch (error) {
        console.error("Error creating request:", error);
        return { error: "Request failed" };
    }
};