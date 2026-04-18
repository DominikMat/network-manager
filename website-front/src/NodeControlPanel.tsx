import { useState } from 'react';

export default function NodeControlPanel({
    nodeName = "Default Node Name",
    positionLeft = 50,
    positionTop = 50,
    id = 0,
    onHoverChange = (id: number, newState: boolean) => {},
    onSubscribeToNode = (id: number) => {},
    onToggleNode = (id: number, newState: boolean) => {}
}) {
    const [isMouseOver, setMouseOver] = useState(false)
    const [enabled, setEnabled] = useState(true)

    function changeHoverState(newState: boolean) {
        setMouseOver(newState)
        if (onHoverChange) onHoverChange(id, newState)
    }
    function changeOnState(newState: boolean) {
        setEnabled(newState)
        onToggleNode(id, newState)
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
                    <strong id="name" style={{color:enabled?"black":"grey"}}> {nodeName} </strong>
                </div>
            ) : (
                <div id="panel">
                    <p> <strong id="name"> {nodeName} </strong> (id {id})</p>
                    <button id="subscribe-btn" onClick={() => onSubscribeToNode(id)}> Subscribe </button>
                    <button id="off-btn" onClick={() => changeOnState(!enabled)}> {enabled ? "Turn off" : "Turn on"} </button>
                </div>
            )}
        </div>
    );
}