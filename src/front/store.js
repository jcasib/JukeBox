export const initialStore = () => {
    return {
        pendingCount: 0,
        tutorial: {
            active: false,
            step: 0
        }
    }
}

export default function storeReducer(store, action = {}) {
    switch (action.type) {
        case 'set_pending_count':
            return { ...store, pendingCount: action.payload }
        
        case 'start_tutorial':
            return { ...store, tutorial: { active: true, step: 0 } }
        
        case 'next_tutorial_step':
            return { ...store, tutorial: { ...store.tutorial, step: store.tutorial.step + 1 } }
        
        case 'end_tutorial':
            return { ...store, tutorial: { active: false, step: 0 } }
        
        default:
            throw Error('Unknown action.')
    }
}