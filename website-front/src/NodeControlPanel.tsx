import { useState } from 'react';

export default function NodeControlPanel({
    nodeName = "Default Node Name",
    positionLeft = 50,
    positionTop = 50,
    id = 0,
    onHoverChange = (id: number, newState: boolean) => {}
}) {
    const [isMouseOver, setMouseOver] = useState(false)

    function changeHoverState(newState: boolean) {
        setMouseOver(newState)
        if (onHoverChange) onHoverChange(id, newState)
    }

    return (
        <div className="nodeControls" 
            style={{
                position: 'fixed',
                top: `${positionTop}%`,
                left: `${positionLeft}%`
            }}
            onMouseOver={() => changeHoverState(true)}
            onMouseLeave={() => changeHoverState(false)}
        > 
            <div id="dot"/> 

            { !isMouseOver ? (
                <div id="panel">
                    <strong id="name"> {nodeName} </strong>
                </div>
            ) : (
                <div id="panel">
                    <strong id="name"> {nodeName} </strong>
                    <button id="subscribe-btn"> Subscribe </button>
                    <button id="off-btn"> Turn off </button>
                </div>
            )}
        </div>
    );
}