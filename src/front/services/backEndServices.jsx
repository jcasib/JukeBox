export const fetchNowPlaying = async () => {
    try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/public/now-playing`);
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
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/public/spotify-queue`);
        const data = await response.json()
        if (!response.ok) {
            return false;
        }
        return data;
    } catch (error) {
        return { queue: [] };
    }
}