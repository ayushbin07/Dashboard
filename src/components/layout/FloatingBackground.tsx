import './floating-bg.css'

export function FloatingBackground() {
    return (
        <div className="floating-area" aria-hidden="true">
            <ul className="floating-circles">
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
            </ul>
        </div>
    )
}
