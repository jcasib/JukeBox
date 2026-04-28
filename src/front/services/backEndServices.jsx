const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

//  — AUTH ————————————————————————————————————————————————————————————————————
export const login = async (email, password) => {
    try {
        const response = await fetch(`${BACKEND_URL}/api/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        return await response.json();
    } catch (error) {
        console.error("Error logging in:", error);
        return { error: "Login failed" };
    }
};

export const register = async (email, password, username) => {
    try {
        const response = await fetch(`${BACKEND_URL}/api/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, username })
        });
        return await response.json();
    } catch (error) {
        console.error("Error registering:", error);
        return { error: "Register failed" };
    }
};

//  — Jukebox ————————————————————————————————————————————————————————————————————
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

export const fetchRecentlyPlayed = async (limit = 20) => {
    try {
        const response = await fetch(
            `${BACKEND_URL}/api/public/recently-played?limit=${limit}`
        );
        const data = await response.json();
        if (!response.ok) {
            return { tracks: [] };
        }
        return data;
    } catch (error) {
        console.error("Error fetching recently played:", error);
        return { tracks: [] };
    }
};

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

//  — Requests ————————————————————————————————————————————————————————————————————
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

        if (response.status === 429) {
            return { error: "rate_limit" }
        }

        return await response.json();
    } catch (error) {
        console.error("Error creating request:", error);
        return { error: "Request failed" };
    }
};

export const fetchMyRequests = async (token) => {
    try {
        const response = await fetch(`${BACKEND_URL}/api/requests/my`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return await response.json();
    } catch (error) {
        console.error("Error fetching my requests:", error);
        return [];
    }
};

export const deleteRequest = async (id, token) => {
    try {
        const response = await fetch(`${BACKEND_URL}/api/requests/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        });
        return await response.json();
    } catch (error) {
        console.error("Error deleting request:", error);
        return { error: "Delete failed" };
    }
};

export const fetchPendingRequests = async (token) => {
    try {
        const response = await fetch(`${BACKEND_URL}/api/moderator/requests`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return await response.json();
    } catch (error) {
        console.error("Error fetching pending requests:", error);
        return [];
    }
};

export const acceptRequest = async (id, token) => {
    try {
        const response = await fetch(`${BACKEND_URL}/api/moderator/requests/${id}/accept`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` }
        });
        return await response.json();
    } catch (error) {
        console.error("Error accepting request:", error);
        return { error: "Accept failed" };
    }
};

export const rejectRequest = async (id, message, token) => {
    try {
        const response = await fetch(`${BACKEND_URL}/api/moderator/requests/${id}/reject`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message })
        });
        return await response.json();
    } catch (error) {
        console.error("Error rejecting request:", error);
        return { error: "Reject failed" };
    }
};

export const getUser = async () => {
    try {
        const response = await fetch(`${BACKEND_URL}/api/get_user`, {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });
        const data = await response.json()
        if (!response.ok) {
            return false;
        }
        return data;
    } catch (error) {
        console.error("Error fetching user:", error);
        return null;
    }
}

export const getRole = async () => {
    try {
        const token = localStorage.getItem("token")
        if (!token) return null
        const response = await fetch(`${BACKEND_URL}/api/me/role`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json()
        if (!response.ok) return null
        return data.role
    } catch (error) {
        return null
    }
}

//  — ADMIN ————————————————————————————————————————————————————————————————————
export const fetchUsers = async (token) => {
    try {
        const response = await fetch(`${BACKEND_URL}/api/admin/users`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return await response.json();
    } catch (error) {
        console.error("Error fetching users:", error);
        return [];
    }
};

export const updateUserRole = async (id, role, token) => {
    try {
        const response = await fetch(`${BACKEND_URL}/api/admin/users/${id}/role`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ role })
        });
        return await response.json();
    } catch (error) {
        console.error("Error updating role:", error);
        return { error: "Update failed" };
    }
};

export const deleteUser = async (id, token) => {
    try {
        const response = await fetch(`${BACKEND_URL}/api/admin/users/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        });
        return await response.json();
    } catch (error) {
        console.error("Error deleting user:", error);
        return { error: "Delete failed" };
    }
};

export const muteUser = async (id, minutes, token) => {
    try {
        const response = await fetch(`${BACKEND_URL}/api/admin/users/${id}/mute`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ minutes })
        });
        return await response.json()
    } catch (error) {
        console.error("Error muting user:", error);
        return { error: "Mute failed" };
    }    
};

export const unmuteUser = async (id, token) => {
    try {
        const response = await fetch(`${BACKEND_URL}/api/admin/users/${id}/unmute`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` }
        });
        return await response.json();        
    } catch (error) {
        console.error("Error unmuting user:", error);
        return { error: "Unmute failed" }
    }
};

//  — Spotify Player Controls ————————————————————————————————————————————————————————————————————
export const fetchSpotifyStatus = async (token) => {
    try {
        const response = await fetch(`${BACKEND_URL}/api/admin/spotify/status`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return await response.json();
    } catch (error) {
        return { connected: false };
    }
};

export const playerPlay = async (token) => {
    await fetch(`${BACKEND_URL}/api/admin/player/play`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const playerPause = async (token) => {
    await fetch(`${BACKEND_URL}/api/admin/player/pause`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const playerNext = async (token) => {
    await fetch(`${BACKEND_URL}/api/admin/player/next`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const playerPrevious = async (token) => {
    await fetch(`${BACKEND_URL}/api/admin/player/previous`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const playerVolume = async (volume, token) => {
    await fetch(`${BACKEND_URL}/api/admin/player/volume?volume_percent=${volume}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const playerShuffle = async (state, token) => {
    await fetch(`${BACKEND_URL}/api/admin/player/shuffle?state=${state}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
    });
};