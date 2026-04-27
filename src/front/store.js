export const initialStore = () => {
    return {
        pendingCount: 0
    }
}

export default function storeReducer(store, action = {}) {
    switch (action.type) {
        case 'set_pending_count':
            return {
                ...store,
                pendingCount: action.payload
            }
        default:
            throw Error('Unknown action.')
    }
}