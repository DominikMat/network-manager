import './App.css';
import { useRef, useEffect, Ref, useState } from 'react';
import NodeControlPanel from './NodeControlPanel';
import { nodeUIList, topologyData } from './nodesUI';

function App() {
    const [currentNodeSelected, setNodeSelected] = useState(-1)

    function onNodeHoverStateChange(index:number, newState: boolean) {
        setNodeSelected( newState ? index : -1 )
    }       

    return (
        <div> 
            {/* Title and credits */}
            <div id='app-title'> Network Manager (Hitachi Assignment) </div>
            <div id='credits'> 
                <p> by: <i> Dominik Matuszczyk </i> (2026) </p>
                <p> *pozycje na mapie niekoniecznie odpowiadają prawdziwym </p>
            </div>

            {/* Map Display */}
            <div className='map-parent'>
                {/* Map Image */}
                <img src='/poland-outline.jpg'></img>
                
                {/* Node connections */}
                <svg 
                    className="connections-layer"
                    viewBox="0 0 100 100" 
                    preserveAspectRatio="none"
                >
                    {topologyData.connections.map((connection, index) => {
                        const startNode = nodeUIList[connection.from];
                        const endNode = nodeUIList[connection.to];
                        return (
                            <line 
                                key={index}
                                x1={startNode.positionLeft} y1={startNode.positionTop} 
                                x2={endNode.positionLeft} y2={endNode.positionTop} 
                                stroke={connection.from == currentNodeSelected || connection.to == currentNodeSelected ? "black" : "rgba(0,0,0,0.25)"}
                                strokeWidth="0.2"
                                strokeDasharray="1 0.75"
                            />
                        );
                    })}
                </svg>

                {/* Node Control Panels UI*/}
                { nodeUIList && nodeUIList.length>0 ?(
                    nodeUIList.map( (nodeUIData, index) => {
                        return (
                            <NodeControlPanel
                                nodeName={nodeUIData.name}
                                positionLeft={nodeUIData.positionLeft}
                                positionTop={nodeUIData.positionTop}
                                id={index}
                                onHoverChange={onNodeHoverStateChange}
                            />
                        )
                    })
                    ) : (null)
                }
            </div>
        </div>
    );
}

export default App;
