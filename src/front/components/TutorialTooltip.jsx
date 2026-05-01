import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import useGlobalReducer from "../hooks/useGlobalReducer"

export const TutorialTooltip = ({ steps }) => {
    const { store, dispatch } = useGlobalReducer()
    const { active, step } = store.tutorial
    const [pos, setPos] = useState(null)
    const navigate = useNavigate()

    const currentStep = steps[step]

    useEffect(() => {
        if (!active || !currentStep) return

        const el = document.querySelector(currentStep.selector)
        if (!el) return

        el.scrollIntoView({ behavior: "smooth", block: "center" })

        const timer = setTimeout(() => {
            const rect = el.getBoundingClientRect()
            const isTop = currentStep.position === "top"
            setPos({
                top: isTop
                    ? rect.top + window.scrollY - 180
                    : rect.bottom + window.scrollY + 12,
                left: rect.left + rect.width / 2,
            })
        }, 400)

        el.style.outline = "2px solid var(--primary)"
        el.style.borderRadius = "8px"

        return () => {
            clearTimeout(timer)
            el.style.outline = ""
            el.style.borderRadius = ""
        }
    }, [active, step, currentStep])

    if (!active || !currentStep || !pos) return null

    const handleNext = () => {
        if (currentStep.navigateTo) {
            navigate(currentStep.navigateTo)
            setTimeout(() => {
                dispatch({ type: 'end_tutorial' })
                setTimeout(() => dispatch({ type: 'start_tutorial' }), 100)
            }, 300)
        } else if (step >= steps.length - 1) {
            dispatch({ type: 'end_tutorial' })
            localStorage.setItem("tutorial_done", "true")
        } else {
            dispatch({ type: 'next_tutorial_step' })
        }
    }

    const handleSkip = () => {
        dispatch({ type: 'end_tutorial' })
        localStorage.setItem("tutorial_done", "true")
    }

    return (
        <>
            {/* Overlay oscuro */}
            <div style={{
                position: "fixed", inset: 0,
                background: "#00000066",
                zIndex: 999,
                pointerEvents: "none"
            }} />

            {/* Tooltip */}
            <div style={{
                position: "absolute",
                top: pos.top,
                left: Math.min(Math.max(pos.left - 150, 16), window.innerWidth - 316),
                width: "300px",
                background: "var(--secondary)",
                borderRadius: "12px",
                padding: "16px",
                zIndex: 1000,
                boxShadow: "0 4px 24px #00000060"
            }}>
                {/* Indicador de paso */}
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <span style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>
                        {step + 1} / {steps.length}
                    </span>
                    <button
                        className="btn btn-sm p-0"
                        style={{ fontSize: "11px", color: "var(--muted-foreground)" }}
                        onClick={handleSkip}
                    >
                        Saltar
                    </button>
                </div>

                {/* Título */}
                <div style={{ fontWeight: "700", fontSize: "15px", marginBottom: "6px" }}>
                    {currentStep.title}
                </div>

                {/* Descripción */}
                <div style={{ fontSize: "13px", color: "var(--muted-foreground)", marginBottom: "14px" }}>
                    {currentStep.description}
                </div>

                {/* Botón siguiente */}
                <button
                    className="btn primary-bottom w-100"
                    onClick={handleNext}
                >
                    {step >= steps.length - 1 ? "¡Entendido!" : currentStep.navigateTo ? "Siguiente →" : "Siguiente →"}
                </button>
            </div>
        </>
    )
}